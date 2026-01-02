import OpenAI from "openai"
import * as dotenv from "dotenv"
import path from "path"

const LOG_PREFIX = "[test-openai]"

// Load environment variables
const envPath = path.resolve(process.cwd(), ".env")
const envLocalPath = path.resolve(process.cwd(), ".env.local")
console.log(`${LOG_PREFIX} Loading env from: ${envPath}`)
dotenv.config({ path: envPath })
console.log(`${LOG_PREFIX} Loading env from: ${envLocalPath}`)
dotenv.config({ path: envLocalPath, override: true })

type AutoUpdatePayload = {
  candidateId: number
  candidateName: string
  electionName: string
  partyName?: string | null
  electionTypeName?: string | null
  voteDate?: string | null
}

async function main() {
  console.log(`${LOG_PREFIX} Starting OpenAI test...`)

  const payload: AutoUpdatePayload = {
    candidateId: 12345,
    candidateName: "テスト候補者",
    electionName: "テスト選挙",
    partyName: "テスト党",
    electionTypeName: "テスト選挙種類",
    voteDate: "2025-12-25",
  }

  try {
    const content = await generateWithOpenAI(payload)
    if (content) {
      console.log(`${LOG_PREFIX} Success! Content generated:`)
      console.log(content.substring(0, 200) + "...")
    } else {
      console.warn(`${LOG_PREFIX} Failed: No content generated.`)
    }
  } catch (error: any) {
    console.error(`${LOG_PREFIX} Error occurred:`, error)
    if (error?.status === 429) {
      console.error(`${LOG_PREFIX} CONFIRMED: 429 Too Many Requests`)
    }
  }
}

async function generateWithOpenAI(
  payload: AutoUpdatePayload
): Promise<string | undefined> {
  const apiKey =
    process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY || undefined
  
  if (!apiKey) {
    console.warn(`${LOG_PREFIX} OpenAI skipped (missing API key)`)
    console.log("Env vars loaded:", process.env.OPENAI_API_KEY ? "OPENAI_API_KEY found" : "OPENAI_API_KEY missing")
    return undefined
  }

  console.log(`${LOG_PREFIX} Using API Key: ${apiKey.substring(0, 5)}...`)

  const client = new OpenAI({ apiKey, maxRetries: 2 })
  const prompt = buildActionPrompt(payload)
  
  console.log(`${LOG_PREFIX} Sending request to OpenAI (gpt-5)...`)
  
  const response = await client.responses.create({
    model: "gpt-5",
    reasoning: { effort: "medium" },
    tools: [{ type: "web_search_preview" }],
    input: prompt,
  })

  return response.output_text?.trim()
}

function buildActionPrompt(payload: AutoUpdatePayload): string {
  const startDate = sanitizeDate(payload.voteDate)
  const today = new Date().toISOString().slice(0, 10)
  const party = payload.partyName?.trim() || "情報未提供"
  const electionType =
    payload.electionTypeName?.trim() || "情報未提供（選挙種類）"

  return `
役割: あなたは中立な編集者です。以下の入力情報に基づき、必ず web_search を用いて一次・公的ソースを優先して調査し、候補者の「選挙の確定日から現時点まで」の実績・活動を、推測・創作なしで整理してください。出力はシンプルなリストHTMLのみ（<ul>/<ol>/<li>、必要に応じ<a>、<time>、<q>）を用い、日本語で簡潔に作成します。

# 入力（この範囲から外れないこと）
- 候補者: ${payload.candidateName}
- 選挙: ${payload.electionName}
- 選挙種類: ${electionType}
- 所属/政党: ${party}
- 選挙の確定日（当確/公示のどちらでもない。確定=当選発表日または開票確定日）: ${startDate}
- 現在日: ${today}

# 行動方針（web_searchの必須利用）
1) 収集対象期間は「選挙の確定日（含む）」から「現在日（含む）」まで。
2) web_search を用いて、以下の順でソースを探索・採用（重視順）:
   a. 国会・選挙管理委員会・自治体等の公的機関
   b. 候補者の公式サイト・政務活動報告・公式SNS
   c. 信頼度の高い報道（NHK、全国紙、地方紙、通信社、放送局、業界紙）
   ※再転載・まとめサイト・個人ブログは採用しない
3) クエリ例（日本語中心、必要に応じ組み合わせ）:
   - 「${payload.candidateName} 実績」「${payload.candidateName} 活動報告」「${payload.candidateName} 国会質疑」
   - 「${payload.candidateName} 法案 提出」「${payload.candidateName} 記者会見」
   - 「${payload.candidateName} 地元 活動」「${payload.candidateName} 公式サイト お知らせ」
4) 採用件数は3〜12件に限定。重複・再掲は最新情報のみ残す。
5) 抽出は「実際に行われた事実（日時・主体・行為）」のみに限定。意見表明は<q>で短く引用し、URLと日付（<time>）を必ず付す。

# 記載基準・検証
- すべての記述は少なくとも1つの採用ソースで検証可能であること。
- 数値・肩書・役職・日付はソースと厳密一致。曖昧なものは記載しない。
- うわさ・未確認情報・二次情報のみの断定は不可。必要なら「論点」に中立的に整理し、複数ソースを併記。
- 同一出来事は1回のみ記載（重複排除）。
- 活動の分類例：国会活動／法案・提言／地元・地域活動／政策広報／メディア出演／SNS公式発表／資金・監査関連など。

# 出力制約（非常に重要）
- HTMLは <ul>/<ol>/<li> のみ。必要に応じ <a>、<time>、<q> を使用可。
- 見出しタグや<p>、スタイル、コメントは禁止。
- 各実績には可能な限り<time datetime="YYYY-MM-DD">と<a>出典を付す。

# 出力構成（順序・入れ子を厳守）
<ul>
  <li>タイトル：${payload.candidateName} / 実績・活動（${startDate}〜${today}）</li>
  <li>要約：
    <ul>
      <li>期間内の主な実績・活動を3〜5点で簡潔に</li>
    </ul>
  </li>
  <li>タイムライン（年代順）：
    <ol>
      <li><!-- <time> と <a> を伴う出来事。最大12件 --></li>
    </ol>
  </li>
  <li>分野別サマリ：
    <ul>
      <li>国会活動：<ul><!-- 箇条書き。各項目に根拠ソース --></ul></li>
      <li>法案・提言：<ul></ul></li>
      <li>地元・地域：<ul></ul></li>
      <li>政策広報・会見：<ul></ul></li>
      <li>メディア出演：<ul></ul></li>
      <li>SNS公式発表：<ul></ul></li>
      <li>資金・監査関連：<ul><!-- 必要時のみ --></ul></li>
    </ul>
  </li>
  <li>論点・留意事項（中立）：
    <ul>
      <li><!-- 確認中/見解相違/訂正等。各項目に<a>と<time> --></li>
    </ul>
  </li>
  <li>出典：
    <ol>
      <li><!-- 採用ソース（3〜12件）。<a>と<time>必須 --></li>
    </ol>
  </li>
  <li>最終更新：<time datetime="${today}">${today}</time></li>
</ul>

# 例外時の扱い
- 期間内の一次情報が見当たらない場合は、該当セクションに <li>情報未提供</li> と明記。
- 二次報道のみの場合は断定せず「〜と報じられた」と記載し、必ず出典を付す。
`
}

function sanitizeDate(value?: string | null): string {
  if (!value) return "情報未提供"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "情報未提供"
  }
  return date.toISOString().slice(0, 10)
}

main().catch(console.error)
