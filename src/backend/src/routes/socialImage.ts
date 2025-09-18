import { Router } from "express"
import http from "http"
import https from "https"
import { URL } from "url"
import zlib from "zlib"
import fs from "fs"
import path from "path"
import crypto from "crypto"

const router = Router()

// 1-hour file-based cache for resolved imageUrl per requested URL
const CACHE_TTL_MS = 60 * 60 * 1000
const CACHE_DIR = path.resolve(process.cwd(), ".cache", "social-image")

function cacheKeyFromUrl(u: string): string {
  return crypto.createHash("sha256").update(u).digest("hex")
}

async function readCache(u: string): Promise<string | null> {
  try {
    const file = path.join(CACHE_DIR, `${cacheKeyFromUrl(u)}.json`)
    const stat = await fs.promises.stat(file)
    const age = Date.now() - stat.mtimeMs
    if (age > CACHE_TTL_MS) return null
    const raw = await fs.promises.readFile(file, "utf8")
    const obj = JSON.parse(raw)
    if (obj && typeof obj.imageUrl === "string" && obj.imageUrl) {
      return obj.imageUrl
    }
  } catch {
    // cache miss or parse error -> ignore
  }
  return null
}

async function writeCache(u: string, imageUrl: string): Promise<void> {
  try {
    await fs.promises.mkdir(CACHE_DIR, { recursive: true })
    const file = path.join(CACHE_DIR, `${cacheKeyFromUrl(u)}.json`)
    await fs.promises.writeFile(
      file,
      JSON.stringify({ imageUrl }, null, 2),
      "utf8"
    )
  } catch {
    // ignore cache write errors
  }
}

async function fetchHtml(targetUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let urlObj: URL
    try {
      urlObj = new URL(targetUrl)
    } catch (e) {
      return reject(new Error("Invalid URL"))
    }

    const lib = urlObj.protocol === "https:" ? https : http
    const opts: any = {
      headers: {
        // Use a common UA so servers return standard HTML / card meta tags
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        // Ask for compressed content so servers may respond with gzip/br
        "Accept-Encoding": "gzip, deflate, br",
      },
      timeout: 8000,
    }

    const req = lib.get(targetUrl, opts, (res: any) => {
      const status = res.statusCode || 0
      if (status >= 300 && status < 400 && res.headers.location) {
        // follow redirect
        const location = res.headers.location.startsWith("http")
          ? res.headers.location
          : new URL(res.headers.location, urlObj).toString()
        fetchHtml(location).then(resolve).catch(reject)
        return
      } else if (status !== 200) {
        return reject(new Error("Non-200 response fetching URL: " + status))
      }

      // Handle compressed responses (gzip, deflate, br)
      const encoding = (res.headers["content-encoding"] || "").toLowerCase()
      let stream: NodeJS.ReadableStream = res
      if (
        encoding.includes("br") &&
        typeof (zlib as any).createBrotliDecompress === "function"
      ) {
        stream = res.pipe((zlib as any).createBrotliDecompress())
      } else if (encoding.includes("gzip")) {
        stream = res.pipe(zlib.createGunzip())
      } else if (encoding.includes("deflate")) {
        stream = res.pipe(zlib.createInflate())
      }

      let data = ""
      stream.setEncoding && stream.setEncoding("utf8")
      stream.on("data", (chunk: string) => {
        data += chunk
        // Protective limit to avoid extremely large responses
        if (data.length > 2_000_000) {
          try {
            req.destroy()
          } catch {
            // ignore
          }
          reject(new Error("Response too large"))
        }
      })
      stream.on("end", () => {
        resolve(data)
      })
      stream.on("error", (err: Error) => {
        reject(err)
      })
    })

    req.on("error", (err: Error) => {
      reject(err)
    })
    req.on("timeout", () => {
      try {
        req.destroy()
      } catch {
        // ignore
      }
      reject(new Error("Request timed out"))
    })
  })
}

function extractImageFromHtml(html: string, baseUrl?: string): string | null {
  // Try meta tags (og:image, twitter:image)
  // flexible regex: content and property/name order may vary
  const metaRegex =
    /<meta[^>]*(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*content=["']([^"']+)["']|<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:image|twitter:image)["']/i
  const m = html.match(metaRegex)
  let found: string | null = null
  if (m) {
    found = m[1] || m[2] || null
  }

  // If still not found, try to find direct twitter/X media URLs (pbs.twimg.com)
  if (!found) {
    const mediaRegex = /(https?:\/\/pbs\.twimg\.com\/media\/[^\s"'<>]+)/i
    const mm = html.match(mediaRegex)
    if (mm) {
      found = mm[1]
    }
  }

  if (!found) return null

  // Normalize relative URLs
  try {
    const u = new URL(found, baseUrl)
    return u.toString()
  } catch {
    return found
  }
}

/**
 * Helper: follow redirects for short URLs (pic.twitter.com) using HEAD requests,
 * returning the final resolved URL if it points to an image (content-type image/*)
 * or the final Location header.
 */
async function resolveFinalUrl(
  targetUrl: string,
  maxHops = 5
): Promise<string | null> {
  // Try to follow redirects and detect image content-type.
  // First attempt with HEAD (fast), but some hosts (twitter/x) don't expose image via HEAD
  // so fall back to a lightweight GET that inspects headers and aborts the body.
  let current = targetUrl
  for (let i = 0; i < maxHops; i++) {
    let urlObj: URL
    try {
      urlObj = new URL(current)
    } catch (err) {
      return null
    }
    const lib = urlObj.protocol === "https:" ? https : http

    const ua =
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

    // 1) Try HEAD first
    const headResult: {
      status?: number
      location?: string
      contentType?: string
    } = await new Promise((resolve) => {
      const opts: any = {
        method: "HEAD",
        headers: {
          "User-Agent": ua,
          Accept: "*/*",
        },
        timeout: 5000,
      }
      const req = lib.request(current, opts, (res: any) => {
        const status = res.statusCode || 0
        const location = res.headers.location
        const contentType = res.headers["content-type"]
        resolve({ status, location, contentType })
      })
      req.on("error", () => resolve({}))
      req.on("timeout", () => {
        try {
          req.destroy()
        } catch {
          // ignore
        }
        resolve({})
      })
      req.end()
    })

    if (!headResult || !headResult.status) return null

    if (
      headResult.status >= 300 &&
      headResult.status < 400 &&
      headResult.location
    ) {
      const next = headResult.location.startsWith("http")
        ? headResult.location
        : new URL(headResult.location, urlObj).toString()
      current = next
      continue
    }

    if (
      headResult.status === 200 &&
      headResult.contentType &&
      headResult.contentType.startsWith("image/")
    ) {
      return current
    }

    // 2) HEAD didn't reveal an image -> try a lightweight GET and inspect headers.
    // We'll request the URL and immediately destroy the response stream after reading headers
    // so we don't download large image bodies.
    const getResult: {
      status?: number
      location?: string
      contentType?: string
    } = await new Promise((resolve) => {
      try {
        const req = lib.get(
          current,
          {
            headers: {
              "User-Agent": ua,
              Accept: "*/*",
            },
            timeout: 5000,
          },
          (res: any) => {
            const status = res.statusCode || 0
            const location = res.headers.location
            const contentType = res.headers["content-type"]
            // Abort body to avoid downloading full image
            try {
              res.destroy()
            } catch (e) {
              // ignore
            }
            resolve({ status, location, contentType })
          }
        )
        req.on("error", () => resolve({}))
        req.on("timeout", () => {
          try {
            req.destroy()
          } catch {
            // ignore
          }
          resolve({})
        })
      } catch (e) {
        resolve({})
      }
    })

    if (!getResult || !getResult.status) return null

    if (
      getResult.status >= 300 &&
      getResult.status < 400 &&
      getResult.location
    ) {
      const next = getResult.location.startsWith("http")
        ? getResult.location
        : new URL(getResult.location, urlObj).toString()
      current = next
      continue
    }

    if (
      getResult.status === 200 &&
      getResult.contentType &&
      getResult.contentType.startsWith("image/")
    ) {
      return current
    }

    // Not a redirect and not an image; stop trying
    break
  }

  return null
}

/**
 * Try oEmbed publish.twitter.com fallback when page HTML doesn't include og/twitter meta.
 * Returns resolved image URL or null.
 */
async function tryTwitterOembedFallback(
  originalUrl: string
): Promise<string | null> {
  try {
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(
      originalUrl
    )}`
    const html = await fetchHtml(oembedUrl)
    // oembed returns JSON; attempt to parse
    let obj: any = null
    try {
      obj = JSON.parse(html)
    } catch {
      // Some endpoints may return non-JSON; bail
      return null
    }
    if (!obj) return null

    // If oEmbed provides a direct thumbnail_url, prefer it
    if (obj.thumbnail_url && typeof obj.thumbnail_url === "string") {
      return obj.thumbnail_url
    }

    // Otherwise extract pic.twitter.com short link from the embedded HTML
    if (obj.html && typeof obj.html === "string") {
      const picMatch = obj.html.match(
        /https?:\/\/pic\.twitter\.com\/[A-Za-z0-9_-]+/i
      )
      if (picMatch) {
        const picUrl = picMatch[0]
        const resolved = await resolveFinalUrl(picUrl)
        if (resolved) return resolved
      }

      // Also try to find any pbs.twimg.com links inside the HTML
      const pbsMatch = obj.html.match(
        /https?:\/\/pbs\.twimg\.com\/media\/[^\s"'<>]+/i
      )
      if (pbsMatch) {
        return pbsMatch[0]
      }
    }
  } catch (e) {
    // ignore and return null so original flow can continue
    console.error("oembed fallback error:", e)
  }
  return null
}

/**
 * New: Use official Twitter/X API v2 to fetch media URLs for a tweet.
 * Requires environment variable TWITTER_BEARER_TOKEN to be set.
 */
async function fetchMediaUrlFromTwitterApi(
  tweetId: string
): Promise<string | null> {
  const bearer = process.env.TWITTER_BEARER_TOKEN || process.env.X_BEARER_TOKEN
  if (!bearer) {
    // No token configured
    return null
  }

  const path = `/2/tweets/${encodeURIComponent(
    tweetId
  )}?expansions=attachments.media_keys&media.fields=url,preview_image_url,type,variants`
  const opts: any = {
    hostname: "api.twitter.com",
    path,
    method: "GET",
    headers: {
      Authorization: `Bearer ${bearer}`,
      "User-Agent":
        "MyTohyoBackend/1.0 (+https://example.com) fetch-twitter-media",
      Accept: "application/json",
    },
    timeout: 6000,
  }

  return new Promise((resolve) => {
    const req = https.request(opts, (res: any) => {
      let raw = ""
      res.setEncoding && res.setEncoding("utf8")
      res.on("data", (chunk: string) => {
        raw += chunk
        if (raw.length > 2_000_000) {
          try {
            req.destroy()
          } catch {
            // ignore
          }
          resolve(null)
        }
      })
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 400) {
          // Non-success, don't expose details
          console.log(
            "[social-image] Twitter API return error status code:",
            res.statusCode
          )
          resolve(null)
          return
        }
        try {
          const obj = JSON.parse(raw)
          if (!obj) return resolve(null)

          // Look for includes.media
          const media = (obj.includes && obj.includes.media) || []
          if (Array.isArray(media) && media.length > 0) {
            // Prefer photos first
            for (const m of media) {
              if (m.type === "photo") {
                if (m.url) return resolve(m.url)
                if (m.preview_image_url) return resolve(m.preview_image_url)
              }
            }
            // Then look for video/presentation variants (choose first mp4)
            for (const m of media) {
              if (m.type === "video" || m.type === "animated_gif") {
                if (Array.isArray(m.variants)) {
                  // find variant with content_type including mp4
                  const v = m.variants.find((x: any) =>
                    (x.content_type || "").includes("mp4")
                  )
                  if (v && v.url) return resolve(v.url)
                }
                if (m.preview_image_url) return resolve(m.preview_image_url)
              }
            }
          }
        } catch (e) {
          // parsing error
          console.error("Twitter API parse error", e)
        }
        resolve(null)
      })
    })

    req.on("error", () => resolve(null))
    req.on("timeout", () => {
      try {
        req.destroy()
      } catch {
        // ignore
      }
      resolve(null)
    })
    req.end()
  })
}

function extractTweetIdFromUrl(targetUrl: string): string | null {
  // Support urls like:
  // https://twitter.com/{user}/status/{id}
  // https://x.com/{user}/status/{id}
  // and mobile/short variants
  try {
    const u = new URL(targetUrl)
    const hostname = u.hostname.toLowerCase()
    if (!hostname.includes("twitter") && !hostname.includes("x.com")) {
      return null
    }
    const parts = u.pathname.split("/").filter(Boolean) // remove empty
    // find 'status' then next part is id
    const idx = parts.findIndex((p) => p === "status")
    if (idx !== -1 && parts.length > idx + 1) {
      const id = parts[idx + 1]
      if (/^\d+$/.test(id)) return id
    }
    // Some short URLs (t.co/pic) won't match; return null
    return null
  } catch {
    return null
  }
}

// GET /api/social-image?url={url}
// returns { imageUrl: string | null }
router.get("/", async (req, res) => {
  const { url } = req.query
  if (!url || typeof url !== "string") {
    return res.status(400).json({ message: "Missing url query parameter" })
  }

  try {
    // Cache lookup first (1h TTL)
    const cached = await readCache(url)
    if (cached) {
      console.log("[social-image] cache hit:", url)
      return res.json({ imageUrl: cached })
    }
    console.log("[social-image] cache miss:", url)

    // If the URL looks like a Twitter/X tweet, try official API first (recommended)
    const tweetId = extractTweetIdFromUrl(url)
    if (tweetId) {
      const apiResult = await fetchMediaUrlFromTwitterApi(tweetId)
      if (apiResult) {
        await writeCache(url, apiResult).catch(() => {})
        return res.json({ imageUrl: apiResult })
      }
      // If API fails or token missing, fall through to existing HTML / oEmbed flow
      console.log(
        "[social-image] Twitter API did not return media or token missing; falling back",
        apiResult
      )
    }

    // Primary approach: fetch page HTML and parse meta / direct pbs links
    const html = await fetchHtml(url)
    console.log("[social-image] fetched html length:", html ? html.length : 0)
    let imageUrl = extractImageFromHtml(html, url)
    console.log("[social-image] extractImageFromHtml ->", imageUrl)

    // Fallback: for X / Twitter links JS often required; use oEmbed to extract short pic.twitter.com URL
    if (!imageUrl) {
      console.log(
        "[social-image] attempting publish.twitter.com oEmbed fallback"
      )
      imageUrl = await tryTwitterOembedFallback(url)
      console.log("[social-image] oEmbed fallback result ->", imageUrl)
    }

    if (imageUrl) {
      await writeCache(url, imageUrl).catch(() => {})
    }
    return res.json({ imageUrl: imageUrl || null })
  } catch (e) {
    console.error("Failed to fetch social image:", e)
    // Do not expose internal error to client; return null so frontend can fallback
    return res.json({ imageUrl: null })
  }
})

export default router
