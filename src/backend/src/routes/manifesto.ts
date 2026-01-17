import { Router } from "express"
import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"

import { authenticateJWT } from "../middleware/auth"
import { getDataSource } from "../data-source"
import { ManifestoStatus } from "../models/Manifesto"
import { generateManifestoPrompt } from "../prompts/manifestoTemplate"

const router = Router()

type AutoGenerateBody = {
  candidate_name?: string
  election_name?: string
  election_type_name?: string
  achievement_content?: string | null
  notes?: string | null
  existing_manifesto?: string | null
  election_year?: string | number | null
  election_district?: string | null
  party_name?: string | null
  source_urls?: string[] | null
}

// POST /api/manifestos/auto-generate
router.post("/auto-generate", authenticateJWT, async (req, res) => {
  try {
    const {
      candidate_name,
      election_name,
      election_year,
      election_district,
      party_name,
      source_urls,
    } = req.body as AutoGenerateBody

    const candidate = candidate_name?.trim()
    const election = election_name?.trim()

    if (!candidate || !election) {
      return res
        .status(400)
        .json({ message: "candidate_name と election_name は必須です" })
    }

    const apiKey =
      process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY || ""

    if (!apiKey) {
      return res
        .status(400)
        .json({ message: "OpenAI API key が設定されていません" })
    }

    const sanitize = (
      value?: string | number | null,
      fallback = "情報未提供"
    ) => {
      if (value === undefined || value === null) return fallback
      const trimmed = String(value).trim()
      return trimmed === "" ? fallback : trimmed
    }

    const derivedYear = (() => {
      const yearFromRequest = sanitize(election_year, "")
      if (yearFromRequest) return yearFromRequest
      const match = election?.match(/(20\d{2})/)
      if (match) return match[1]
      return "2025"
    })()

    const derivedDistrict = sanitize(election_district, "不明")
    const derivedParty = sanitize(party_name, "無所属")

    const sourceArray = Array.isArray(source_urls) ? source_urls : []

    const source1 = sanitize(sourceArray[0], "{{URL1}}")
    const source2 = sanitize(sourceArray[1], "{{URL2}}")
    const source3 = sanitize(sourceArray[2], "{{URL3}}")

    const today = new Date().toISOString().slice(0, 10)

    const userPrompt = generateManifestoPrompt({
      candidate,
      election: sanitize(election, "第27回参議院議員通常選挙") as string,
      derivedYear,
      derivedDistrict,
      derivedParty,
      source1,
      source2,
      source3,
      today,
    })

    console.log("userPrompt", userPrompt)

    let content: string | undefined

    try {
      const client = new OpenAI({ apiKey })
      const response = await client.responses.create({
        model: "gpt-5",
        reasoning: { effort: "medium" },
        tools: [{ type: "web_search_preview" }],
        input: userPrompt,
      })
      content = response.output_text?.trim()
    } catch (error: any) {
      if (error?.status === 429) {
        console.warn(
          "[manifestos/auto-generate] OpenAI 429, falling back to Gemini..."
        )
        const geminiKey = process.env.GEMINI_API_KEY
        console.warn(process.env)

        if (geminiKey) {
          try {
            const genAI = new GoogleGenerativeAI(geminiKey)
            const model = genAI.getGenerativeModel({
              model: "gemini-2.0-flash-exp",
            })
            const result = await model.generateContent(userPrompt)
            const response = await result.response
            content = response.text()
          } catch (geminiError) {
            console.error(
              "[manifestos/auto-generate] Gemini fallback failed:",
              geminiError
            )
            throw error // Throw original error if fallback fails
          }
        } else {
          console.warn(
            "[manifestos/auto-generate] Gemini skipped (missing API key)"
          )
          throw error
        }
      } else {
        throw error
      }
    }

    if (!content) {
      return res.status(502).json({ message: "生成結果を取得できませんでした" })
    }

    return res.json({ content })
  } catch (error) {
    console.error("[manifestos/auto-generate] failed:", error)
    return res
      .status(500)
      .json({ message: "サーバー内部でエラーが発生しました" })
  }
})

// POST /api/manifestos
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const {
      candidate_name,
      election_name,
      content,
      content_format,
      status: requestedStatus,
    } = req.body as {
      candidate_name?: string
      election_name?: string
      content?: string
      content_format?: string
      status?: string | null
    }

    const candidate = candidate_name?.trim()
    const election = election_name?.trim()
    const body = content?.trim()
    const format = (content_format || "html").trim().toLowerCase()

    if (!candidate || !election || !body) {
      return res.status(400).json({ message: "必須項目が不足しています" })
    }

    if (format !== "markdown" && format !== "html") {
      return res.status(400).json({ message: "content_format が不正です" })
    }

    let status: ManifestoStatus | null = null
    if (requestedStatus !== undefined && requestedStatus !== null) {
      if (typeof requestedStatus !== "string") {
        return res
          .status(400)
          .json({ message: "status は文字列で指定してください" })
      }
      const normalizedStatus = requestedStatus.trim().toUpperCase()
      const allowed: ManifestoStatus[] = ["PROGRESS", "COMPLETE"]
      if (!allowed.includes(normalizedStatus as ManifestoStatus)) {
        return res.status(400).json({ message: "status が不正です" })
      }
      status = normalizedStatus as ManifestoStatus
    }

    const ds = await getDataSource()

    const existingCandidateRows = await ds.query(
      `SELECT candidate_id, name FROM CANDIDATE WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [candidate]
    )

    let candidateId: number
    let canonicalCandidateName: string

    if (existingCandidateRows && existingCandidateRows.length > 0) {
      candidateId = existingCandidateRows[0].candidate_id
      canonicalCandidateName = existingCandidateRows[0].name
    } else {
      const insertedCandidateRows = await ds.query(
        `INSERT INTO CANDIDATE (name, party_id, manifesto_url, achievements) VALUES ($1, NULL, NULL, NULL)
         RETURNING candidate_id, name`,
        [candidate]
      )

      candidateId = insertedCandidateRows[0].candidate_id
      canonicalCandidateName = insertedCandidateRows[0].name
    }

    const rows = await ds.query(
      `
        INSERT INTO MANIFESTO (candidate_id, candidate_name, election_name, content, content_format, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (candidate_id, election_name)
        DO UPDATE SET candidate_name = EXCLUDED.candidate_name, content = EXCLUDED.content, content_format = EXCLUDED.content_format, status = EXCLUDED.status
        RETURNING manifesto_id, status
      `,
      [candidateId, canonicalCandidateName, election, body, format, status]
    )

    const manifestoId = rows?.[0]?.manifesto_id
    const savedStatus = rows?.[0]?.status ?? status ?? null

    return res.status(201).json({
      manifesto_id: manifestoId,
      candidate_id: candidateId,
      candidate_name: canonicalCandidateName,
      election_name: election,
      content: body,
      content_format: format,
      status: savedStatus,
    })
  } catch (error) {
    console.error("[manifestos] failed to upsert:", error)
    return res.status(500).json({ message: "マニフェストの登録に失敗しました" })
  }
})

export default router
