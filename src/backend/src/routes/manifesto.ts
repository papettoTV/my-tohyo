import { Router } from "express"
import OpenAI from "openai"

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

    const userPrompt = `役割: あなたは中立な編集者です。以下の「検証済み事実情報」だけを根拠に、${derivedYear}年参院選 ${derivedDistrict}選挙区に出馬の「${candidate}」のマニフェストを、シンプルなリストHTMLのみで作成してください。

出力制約:
- <ul>/<ol>/<li>のみ使用（必要に応じ<a>, <time>, <q>可）。見出しタグや<p>、スタイル、コメントは使わない。
- 事実情報に無い記述は禁止。不足は「情報未提供」と明記。
- 数値・固有名詞は出典と一致する場合のみ。
- 引用は短く<q>で可（出典URL・日付を併記）。

検証済み事実情報:
- 選挙名: ${sanitize(election, "第27回参議院議員通常選挙")}
- 年: ${derivedYear}
- 選挙区: ${derivedDistrict}
- 候補者: ${candidate}
- 所属: ${derivedParty}

出力構成（この順番・入れ子を厳守）:
<ul>
  <li>■要約：<ul><li><!-- 3〜5行 --></li></ul></li>
  <li>■公約：<ul><!-- 最大7項目 --></ul></li>
  <li>■具体策：
    <ul>
      <li>経済・物価：<ul><!-- 箇条書き --></ul></li>
      <li>子育て・教育：<ul><!-- 箇条書き --></ul></li>
      <li>社会保障：<ul><!-- 箇条書き --></ul></li>
      <li>地域・生活：<ul><!-- 箇条書き --></ul></li>
      <li>行政・政治改革：<ul><!-- 箇条書き --></ul></li>
    </ul>
  </li>
  <li>■財源・実施スケジュール：{{情報未提供 も可}}</li>
  <li>■実績・背景：<ul><!-- 事実のみ --></ul></li>
  <li>■論点・留意事項（中立）：<ul><li><!-- 1〜3点 --></li></ul></li>
  <li>■出典：
    <ol>
      <li><a href="${source1}" target="_blank" rel="noopener">公式/報道1</a></li>
      <li><a href="${source2}" target="_blank" rel="noopener">公式/報道2</a></li>
      <li><a href="${source3}" target="_blank" rel="noopener">公式/報道3</a></li>
    </ol>
  </li>
  <li>最終更新：<time datetime="${today}">${today}</time></li>
</ul>`

    console.log("userPrompt", userPrompt)

    const client = new OpenAI({ apiKey })

    const response = await client.responses.create({
      model: "gpt-5",
      input: userPrompt,
    })

    const content = response.output_text?.trim()

    if (!content) {
      console.error(
        "[manifestos/auto-generate] unexpected API response:",
        JSON.stringify(response, null, 2)
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
    const format = (content_format || "html").trim().toLowerCase()

    if (!candidate || !election || !body) {
      return res.status(400).json({ message: "必須項目が不足しています" })
    }

    if (format !== "markdown" && format !== "html") {
      return res.status(400).json({ message: "content_format が不正です" })
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
        INSERT INTO MANIFESTO (candidate_id, candidate_name, election_name, content, content_format)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (candidate_id, election_name)
        DO UPDATE SET candidate_name = EXCLUDED.candidate_name, content = EXCLUDED.content, content_format = EXCLUDED.content_format
        RETURNING manifesto_id
      `,
      [candidateId, canonicalCandidateName, election, body, format]
    )

    const manifestoId = rows?.[0]?.manifesto_id

    return res.status(201).json({
      manifesto_id: manifestoId,
      candidate_id: candidateId,
      candidate_name: canonicalCandidateName,
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
