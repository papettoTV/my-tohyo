import { Router } from "express"

import { authenticateJWT } from "../middleware/auth"
import { getDataSource } from "../data-source"

const router = Router()

type AutoGenerateBody = {
  candidate_name?: string
  election_name?: string
  election_type_name?: string
  achievement_content?: string | null
  notes?: string | null
  existing_manifesto?: string | null
}

// POST /api/manifestos/auto-generate
router.post("/auto-generate", authenticateJWT, async (req, res) => {
  try {
    const {
      candidate_name,
      election_name,
      election_type_name,
      achievement_content,
      notes,
      existing_manifesto,
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

    const contextSections: string[] = []
    contextSections.push(`候補者: ${candidate}`)
    contextSections.push(`選挙: ${election}`)
    if (election_type_name?.trim()) {
      contextSections.push(`選挙の種類: ${election_type_name.trim()}`)
    }
    if (achievement_content?.trim()) {
      contextSections.push(`既存の実績・活動:\n${achievement_content.trim()}`)
    }
    if (notes?.trim()) {
      contextSections.push(`投票メモ:\n${notes.trim()}`)
    }
    if (existing_manifesto?.trim()) {
      contextSections.push(`既存のマニフェスト:\n${existing_manifesto.trim()}`)
    }

    const systemPrompt =
      "あなたは日本の地方選挙に詳しい政策ライターです。候補者のマニフェスト案を分かりやすい日本語でMarkdown形式 (見出しと箇条書き中心) で作成してください。極端な表現や事実不明な内容は避け、与えられた情報を基に現実的で実行可能な政策を提案してください。"

    const userPrompt = `${contextSections.join(
      "\n\n"
    )}\n\n求める出力:\n- Markdownで書かれたマニフェスト案\n- 見出し、箇条書きを使って整理\n- 実現手段や期待効果を簡潔に記載`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 700,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("[manifestos/auto-generate] upstream error:", text)
      return res
        .status(502)
        .json({ message: "ChatGPT API 呼び出しに失敗しました" })
    }

    const completion = (await response.json()) as any
    const content: string | undefined =
      completion?.choices?.[0]?.message?.content?.trim()

    if (!content) {
      console.error(
        "[manifestos/auto-generate] unexpected API response:",
        JSON.stringify(completion, null, 2)
      )
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
    const { candidate_name, election_name, content, content_format } =
      req.body as {
        candidate_name?: string
        election_name?: string
        content?: string
        content_format?: string
      }

    const candidate = candidate_name?.trim()
    const election = election_name?.trim()
    const body = content?.trim()
    const format = (content_format || "markdown").trim().toLowerCase()

    if (!candidate || !election || !body) {
      return res.status(400).json({ message: "必須項目が不足しています" })
    }

    if (format !== "markdown" && format !== "html") {
      return res.status(400).json({ message: "content_format が不正です" })
    }

    const ds = await getDataSource()
    const rows = await ds.query(
      `
        INSERT INTO MANIFESTO (candidate_name, election_name, content, content_format)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (candidate_name, election_name)
        DO UPDATE SET content = EXCLUDED.content, content_format = EXCLUDED.content_format
        RETURNING manifesto_id
      `,
      [candidate, election, body, format]
    )

    const manifestoId = rows?.[0]?.manifesto_id

    return res.status(201).json({
      manifesto_id: manifestoId,
      candidate_name: candidate,
      election_name: election,
      content: body,
      content_format: format,
    })
  } catch (error) {
    console.error("[manifestos] failed to upsert:", error)
    return res.status(500).json({ message: "マニフェストの登録に失敗しました" })
  }
})

export default router
