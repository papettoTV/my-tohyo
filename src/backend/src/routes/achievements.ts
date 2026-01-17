import { Router } from "express"
import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"

import { authenticateJWT } from "../middleware/auth"
import { getDataSource } from "../data-source"
import { generateAchievementPrompt } from "../prompts/achievementTemplate"

const router = Router()

type AutoGenerateBody = {
  candidate_name?: string
  election_name?: string
  election_type_name?: string
  vote_date?: string
  party_name?: string | null
}

// POST /api/achievements/auto-generate
router.post("/auto-generate", authenticateJWT, async (req, res) => {
  try {
    const {
      candidate_name,
      election_name,
      election_type_name,
      vote_date,
      party_name,
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

    const sanitize = (val?: string | null, def = "情報未提供") =>
      (val && val.trim() !== "") ? val.trim() : def
    
    // 日付の処理
    const startDate = (() => {
        if (!vote_date) return "情報未提供"
        const d = new Date(vote_date)
        if (Number.isNaN(d.getTime())) return "情報未提供"
        return d.toISOString().slice(0, 10)
    })()

    const today = new Date().toISOString().slice(0, 10)

    const userPrompt = generateAchievementPrompt({
      candidate,
      election: sanitize(election, "選挙"),
      electionType: sanitize(election_type_name, "選挙種類"),
      party: sanitize(party_name, "無所属"),
      startDate,
      today,
    })

    console.log("[achievements/auto-generate] userPrompt length:", userPrompt.length)

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
          "[achievements/auto-generate] OpenAI 429, falling back to Gemini..."
        )
        const geminiKey = process.env.GEMINI_API_KEY

        if (geminiKey) {
          try {
            const genAI = new GoogleGenerativeAI(geminiKey)
            const model = genAI.getGenerativeModel({
              model: "gemini-2.0-flash-exp",
              tools: [{ googleSearchRetrieval: {} }],
            })
            const result = await model.generateContent(userPrompt)
            const response = await result.response
            content = response.text()
          } catch (geminiError) {
            console.error(
              "[achievements/auto-generate] Gemini fallback failed:",
              geminiError
            )
            throw error 
          }
        } else {
          console.warn(
            "[achievements/auto-generate] Gemini skipped (missing API key)"
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
    console.error("[achievements/auto-generate] failed:", error)
    return res
      .status(500)
      .json({ message: "サーバー内部でエラーが発生しました" })
  }
})

// POST /api/achievements (Save achievements)
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const {
      candidate_name,
      content,
    } = req.body as {
      candidate_name?: string
      content?: string
    }

    const candidate = candidate_name?.trim()
    const body = content?.trim()

    if (!candidate || !body) {
      return res.status(400).json({ message: "candidate_name と content は必須です" })
    }

    const ds = await getDataSource()

    // 候補者を特定
    const candidateRows = await ds.query(
      `SELECT candidate_id FROM CANDIDATE WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [candidate]
    )

    if (!candidateRows || candidateRows.length === 0) {
        return res.status(404).json({ message: "候補者が見つかりません" })
    }

    const candidateId = candidateRows[0].candidate_id

    // 実績を更新
    await ds.query(
      `
        UPDATE CANDIDATE
           SET achievements = $1
         WHERE candidate_id = $2
      `,
      [body, candidateId]
    )

    return res.status(200).json({
      candidate_id: candidateId,
      candidate_name: candidate,
      achievements: body
    })

  } catch (error) {
    console.error("[achievements] failed to update:", error)
    return res.status(500).json({ message: "実績の更新に失敗しました" })
  }
})

export default router
