import { NextRequest, NextResponse } from "next/server"
import http from "http"
import https from "https"
import { URL } from "url"
import zlib from "zlib"
import fs from "fs"
import path from "path"
import crypto from "crypto"

// Adapted from backend/src/routes/socialImage.ts
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
    return obj?.imageUrl || null
  } catch {
    return null
  }
}

async function writeCache(u: string, imageUrl: string): Promise<void> {
  try {
    await fs.promises.mkdir(CACHE_DIR, { recursive: true })
    const file = path.join(CACHE_DIR, `${cacheKeyFromUrl(u)}.json`)
    await fs.promises.writeFile(file, JSON.stringify({ imageUrl }, null, 2), "utf8")
  } catch {}
}

async function fetchHtml(targetUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let urlObj: URL
    try {
      urlObj = new URL(targetUrl)
    } catch {
      return reject(new Error("Invalid URL"))
    }
    const lib = urlObj.protocol === "https:" ? https : http
    const opts = {
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
      },
      timeout: 8000,
    }
    const req = lib.get(targetUrl, opts, (res: any) => {
      const status = res.statusCode || 0
      if (status >= 300 && status < 400 && res.headers.location) {
        const location = res.headers.location.startsWith("http") ? res.headers.location : new URL(res.headers.location, urlObj).toString()
        fetchHtml(location).then(resolve).catch(reject)
        return
      } else if (status !== 200) {
        return reject(new Error("Non-200 response: " + status))
      }
      const encoding = (res.headers["content-encoding"] || "").toLowerCase()
      let stream: NodeJS.ReadableStream = res
      if (encoding.includes("br") && typeof (zlib as any).createBrotliDecompress === "function") {
        stream = res.pipe((zlib as any).createBrotliDecompress())
      } else if (encoding.includes("gzip")) {
        stream = res.pipe(zlib.createGunzip())
      } else if (encoding.includes("deflate")) {
        stream = res.pipe(zlib.createInflate())
      }
      let data = ""
      stream.on("data", (chunk) => {
        data += chunk
        if (data.length > 2_000_000) {
          req.destroy()
          reject(new Error("Response too large"))
        }
      })
      stream.on("end", () => resolve(data))
      stream.on("error", reject)
    })
    req.on("error", reject)
  })
}

function extractImageFromHtml(html: string, baseUrl?: string): string | null {
  const metaRegex = /<meta[^>]*(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*content=["']([^"']+)["']|<meta[^Base]*content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:image|twitter:image)["']/i
  const m = html.match(metaRegex)
  let found = m ? (m[1] || m[2]) : null
  if (!found) {
    const mediaRegex = /(https?:\/\/pbs\.twimg\.com\/media\/[^\s"'<>]+)/i
    const mm = html.match(mediaRegex)
    if (mm) found = mm[1]
  }
  if (!found) return null
  try {
    return new URL(found, baseUrl).toString()
  } catch {
    return found
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get("url")
  if (!url) return NextResponse.json({ message: "Missing url" }, { status: 400 })

  try {
    const cached = await readCache(url)
    if (cached) return NextResponse.json({ imageUrl: cached })

    const html = await fetchHtml(url)
    const imageUrl = extractImageFromHtml(html, url)
    if (imageUrl) await writeCache(url, imageUrl)
    return NextResponse.json({ imageUrl: imageUrl || null })
  } catch (error) {
    console.error("Social image fetch failed:", error)
    return NextResponse.json({ imageUrl: null })
  }
}
