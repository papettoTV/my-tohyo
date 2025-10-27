import OpenAI from "openai"
const client = new OpenAI()

const userPrompt = `
役割: あなたは中立な編集者です。以下の「検証済み事実情報」だけを根拠に、2025年参院選 兵庫県選挙区に出馬の「泉房穂」のマニフェストを、シンプルなリストHTMLのみで作成してください。

出力制約:
- <ul>/<ol>/<li>のみ使用（必要に応じ<a>, <time>, <q>可）。見出しタグや<p>、スタイル、コメントは使わない。
- 事実情報に無い記述は禁止。不足は「情報未提供」と明記。
- 数値・固有名詞は出典と一致する場合のみ。
- 引用は短く<q>で可（出典URL・日付を併記）。

検証済み事実情報:
- 選挙名: 2025年参院選
- 年: 2025
- 選挙区: 兵庫
- 候補者: 泉房穂
- 所属: 無所属

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
      <li><a href="{{URL1}}" target="_blank" rel="noopener">公式/報道1</a></li>
      <li><a href="{{URL2}}" target="_blank" rel="noopener">公式/報道2</a></li>
      <li><a href="{{URL3}}" target="_blank" rel="noopener">公式/報道3</a></li>
    </ol>
  </li>
  <li>最終更新：<time datetime="2025-10-21">2025-10-21</time></li>
</ul>
`

const response = await client.responses.create({
  model: "gpt-5",
  input: userPrompt,
})

console.log(response.output_text)
