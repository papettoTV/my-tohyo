import * as fs from "fs"
import * as path from "path"

export type AchievementPromptParams = {
  candidate: string
  election: string
  electionType: string
  party: string
  startDate: string
  today: string
}

export const generateAchievementPrompt = ({
  candidate,
  election,
  electionType,
  party,
  startDate,
  today,
}: AchievementPromptParams): string => {
  const templatePath = path.join(__dirname, "achievement_template.html")
  let htmlTemplate = ""

  try {
    htmlTemplate = fs.readFileSync(templatePath, "utf-8")
  } catch (err) {
    console.error(`Failed to read achievement template from ${templatePath}:`, err)
    htmlTemplate = "<div>Template Load Error</div>"
  }

  // Replace placeholders
  const filledHtml = htmlTemplate.replace(/{{TODAY}}/g, today)

  return `
役割: あなたは中立な編集者です。以下の入力情報に基づき、必ず web_search を用いて一次・公的ソースを優先して調査し、候補者の「選挙の確定日から現時点まで」の実績・活動を、推測・創作なしで整理してください。${startDate}年に出馬の「${candidate}」の実績・活動を、読みやすくメリハリのあるHTML形式で作成してください。

# 入力（この範囲から外れないこと）
- 候補者: ${candidate}
- 選挙: ${election}
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
   - 「${candidate} 実績」「${candidate} 活動報告」「${candidate} 国会質疑」
   - 「${candidate} 法案 提出」「${candidate} 記者会見」
   - 「${candidate} 地元 活動」「${candidate} 公式サイト お知らせ」
4) 採用件数は3〜12件に限定。重複・再掲は最新情報のみ残す。
5) 抽出は「実際に行われた事実（日時・主体・行為）」のみに限定。意見表明は<q>で短く引用し、URLと日付（<time>）を必ず付す。

# 記載基準・検証
- すべての記述は少なくとも1つの採用ソースで検証可能であること。
- 数値・肩書・役職・日付はソースと厳密一致。曖昧なものは記載しない。
- うわさ・未確認情報・二次情報のみの断定は不可。必要なら「論点」に中立的に整理し、複数ソースを併記。
- 同一出来事は1回のみ記載（重複排除）。
- 活動の分類例：国会活動／法案・提言／地元・地域活動／政策広報／メディア出演／SNS公式発表／資金・監査関連など。

# 出力制約（非常に重要）
- HTMLタグ（<h3>, <p>, <ul>, <ol>, <li>, <strong>, <a>, <time>, <q>, <div>, <section>）を使用。
- Tailwind CSSクラスで見た目を整えること（例: text-lg, font-bold, mb-2, list-disc, pl-5, space-y-2など）。
- <h1>, <h2> は使用しない。
- 事実情報に無い記述は禁止。不足は「情報未提供」と明記。
- 数値・固有名詞は出典と一致する場合のみ。
- 各セクション間は十分な余白（mb-6など）を取る。
- 各実績には可能な限り<time datetime="YYYY-MM-DD">と<a>出典を付す。

# 出力構成（以下のセクション構成を厳守）
${filledHtml}

# 例外時の扱い
- 期間内の一次情報が見当たらない場合は、該当セクションに <li>情報未提供</li> と明記。
- 二次報道のみの場合は断定せず「〜と報じられた」と記載し、必ず出典を付す。
`
}
