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

    if (!election || (!candidate && !party_name)) {
      return res
        .status(400)
        .json({ message: "election_name と candidate_name または party_name は必須です" })
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
      candidate: candidate as string,
      election: sanitize(election, "選挙"),
      electionType: sanitize(election_type_name, "選挙種類"),
      party: sanitize(party_name, "無所属"),
      startDate,
      today,
    })

    console.log("[achievements/auto-generate] userPrompt length:", userPrompt.length)

    let content: string | undefined

    if (process.env.CALL_PROMPT_FLG !== "true") {
      console.log("[achievements/auto-generate] CALL_PROMPT_FLG is not true. Using dummy data.");
      content = `
        <ul>
          <li>タイトル：${candidate} / 実績・活動 (ダミー)</li>
          <li>要約：<ul><li>これはダミーの実績データです。</li></ul></li>
        </ul>
      `;
    } else {
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
      election_name,
      content,
      party_name,
    } = req.body as {
      candidate_name?: string
      election_name?: string
      content?: string
      party_name?: string | null
    }

    const candidate = candidate_name?.trim() || null
    const election = election_name?.trim()
    const body = content?.trim()
    const partyIdFromReq = (req.body as any).party_id || null

    if (!election || !body || (!candidate && !partyIdFromReq && !party_name)) {
      return res.status(400).json({ message: "必須項目が不足しています" })
    }

    const ds = await getDataSource()

    let candidateId: number | null = null
    let canonicalCandidateName: string = candidate || party_name || "不明"

    if (candidate) {
        // すでに実績があればそれを返す
        const rows = await ds.query(
          `SELECT content FROM CANDIDATE_CONTENT
           WHERE candidate_name = $1 AND election_name = $2 AND type = 'achievement' LIMIT 1`,
          [candidate, election]
        )

        if (rows && rows.length > 0) {
          return res.status(200).json({
            candidate_id: null,
            candidate_name: candidate,
            election_name: election,
            achievements: rows[0].content
          })
        }

      const candidateRows = await ds.query(
        `SELECT candidate_id, name FROM CANDIDATE WHERE LOWER(name) = LOWER($1) LIMIT 1`,
        [candidate]
      )

      if (candidateRows && candidateRows.length > 0) {
        candidateId = candidateRows[0].candidate_id
        canonicalCandidateName = candidateRows[0].name
      } else {
        const insertedCandidateRows = await ds.query(
          `INSERT INTO CANDIDATE (name, party_id, manifesto_url, achievements) VALUES ($1, NULL, NULL, NULL)
           RETURNING candidate_id, name`,
          [candidate]
        )
        candidateId = insertedCandidateRows[0].candidate_id
        canonicalCandidateName = insertedCandidateRows[0].name
      }
    }

    let partyId: number | null = partyIdFromReq
    if (!partyId && party_name) {
      const partyRows = await ds.query(
        `SELECT party_id FROM PARTY WHERE LOWER(name) = LOWER($1) LIMIT 1`,
        [party_name]
      )
      if (!partyRows || partyRows.length === 0) {
        return res.status(400).json({ message: "政党が見つかりません" })
      }
      partyId = partyRows[0].party_id
    }

    // 実績を CANDIDATE_CONTENT テーブルに保存 (Upsert)
    await ds.query(
      `
        INSERT INTO CANDIDATE_CONTENT (type, candidate_id, party_id, candidate_name, election_name, content, content_format)
        VALUES ('achievement', $1, $2, $3, $4, $5, 'html')
        ON CONFLICT (candidate_id, party_id, election_name, type)
        DO UPDATE SET
          candidate_name = EXCLUDED.candidate_name,
          content = EXCLUDED.content,
          content_format = EXCLUDED.content_format
      `,
      [candidateId, partyId, canonicalCandidateName, election, body]
    )

    return res.status(200).json({
      candidate_id: candidateId,
      candidate_name: canonicalCandidateName,
      election_name: election,
      achievements: body
    })

  } catch (error) {
    console.error("[achievements] failed to update:", error)
    return res.status(500).json({ message: "実績の更新に失敗しました" })
  }
})

export default router
