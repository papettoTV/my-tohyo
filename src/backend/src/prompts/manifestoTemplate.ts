import * as fs from "fs"
import * as path from "path"

export type ManifestoPromptParams = {
  candidate: string
  election: string
  derivedYear: string | number
  derivedDistrict: string
  derivedParty: string
  source1: string
  source2: string
  source3: string
  today: string
}

export const generateManifestoPrompt = ({
  candidate,
  election,
  derivedYear,
  derivedDistrict,
  derivedParty,
  source1,
  source2,
  source3,
  today,
}: ManifestoPromptParams): string => {
  const templatePath = path.join(__dirname, "manifesto_template.html")
  let htmlTemplate = ""

  try {
    htmlTemplate = fs.readFileSync(templatePath, "utf-8")
  } catch (err) {
    console.error(`Failed to read manifesto template from ${templatePath}:`, err)
    // Fallback if file read fails (though it shouldn't in normal dev)
    htmlTemplate = "<div>Template Load Error</div>"
  }

  // Replace placeholders
  // Note: Using simple global replace or replaceAll
  const filledHtml = htmlTemplate
    .replace(/{{SOURCE1}}/g, source1)
    .replace(/{{SOURCE2}}/g, source2)
    .replace(/{{SOURCE3}}/g, source3)
    .replace(/{{TODAY}}/g, today)

  return `役割: あなたは中立な編集者です。以下の「検証済み事実情報」に加え、必ず web_search を用いて一次・公的ソースを優先的に収集し、推測や創作をせずに、${derivedYear}年に出馬の「${candidate}」のマニフェストを、読みやすくメリハリのあるHTML形式で作成してください。

出力制約:
- HTMLタグ（<h3>, <p>, <ul>, <ol>, <li>, <strong>, <a>, <time>, <q>, <div>, <section>）を使用。
- Tailwind CSSクラスで見た目を整えること（例: text-lg, font-bold, mb-2, list-disc, pl-5, space-y-2など）。
- <h1>, <h2> は使用しない。
- 事実情報に無い記述は禁止。不足は「情報未提供」と明記。
- 数値・固有名詞は出典と一致する場合のみ。
- 各セクション間は十分な余白（mb-6など）を取る。

検証済み事実情報:
- 選挙名: ${election}
- 年: ${derivedYear}
- 選挙区: ${derivedDistrict}
- 候補者: ${candidate}
- 所属: ${derivedParty}

出力構成（以下のセクション構成を厳守）:
${filledHtml}`
}
