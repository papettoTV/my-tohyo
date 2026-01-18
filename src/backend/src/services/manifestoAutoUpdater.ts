import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getDataSource } from "../data-source"
import { ManifestoStatus } from "../models/Manifesto"
import { generateManifestoPrompt } from "../prompts/manifestoTemplate"

type AutoUpdatePayload = {
  candidateId: number
  candidateName: string
  electionName: string
  partyName?: string | null
  electionTypeName?: string | null
  voteDate?: string | null
}

const LOG_PREFIX = "[manifesto-auto-update]"

export function scheduleManifestoAutoUpdate(payload: AutoUpdatePayload) {
  // 0ms timeout keeps the HTTP response snappy while we process in background
  setTimeout(() => {
    autoUpdateManifesto(payload).catch((error) => {
      console.error(`${LOG_PREFIX} failed:`, error)
    })
  }, 0)
}

async function autoUpdateManifesto(payload: AutoUpdatePayload) {
  const { candidateId, candidateName, electionName } = payload
  const ds = await getDataSource()

  await ensureManifestoRow(ds, {
    candidateId,
    electionName,
    candidateName,
    status: "PROGRESS",
  })

  // Prepare Prompt Parameters
  // Logic adapted from src/backend/src/routes/manifesto.ts
  const sanitize = (val?: string | null, def = "情報未提供") =>
    (val && val.trim() !== "") ? val.trim() : def

  const derivedYear = (() => {
      // Simple heuristic for year if not provided
      const match = electionName.match(/(20\d{2})/)
      if (match) return match[1]
      if (payload.voteDate) {
          const d = new Date(payload.voteDate)
          if (!Number.isNaN(d.getTime())) return d.getFullYear().toString()
      }
      return new Date().getFullYear().toString()
  })()

  // In the auto-update context from vote, we often don't have detailed district info
  // unless we parse electionName or have it in payload (currently we don't passed district explicitly).
  // We'll use "不明" or try to parse if needed, but for now matching route logic default.
  const derivedDistrict = "不明" 
  
  const derivedParty = sanitize(payload.partyName, "無所属")
  const today = new Date().toISOString().slice(0, 10)

  // Use the shared prompt generator
  const userPrompt = generateManifestoPrompt({
    candidate: candidateName,
    election: electionName,
    derivedYear,
    derivedDistrict,
    derivedParty,
    source1: "{{URL1}}", // No source URLs provided in auto-update from vote yet
    source2: "{{URL2}}",
    source3: "{{URL3}}",
    today,
  })

  let content: string | undefined

  // Feature Flag Check
  if (process.env.CALL_PROMPT_FLG !== "true") {
    console.log(`${LOG_PREFIX} CALL_PROMPT_FLG is not true. Using dummy data.`);
    content = `
      <section>
        <h3 class="text-lg font-bold mb-2">マニフェスト (ダミー)</h3>
        <p>これはダミーのマニフェストデータです。機能フラグが有効な場合にのみLLMによる生成が行われます。</p>
      </section>
    `;
  } else {
    try {
      // 1. Try OpenAI
      content = await generateWithOpenAI(userPrompt)
    } catch (error: any) {
      // 2. If 429, try Gemini
      if (error?.status === 429) {
        console.warn(`${LOG_PREFIX} OpenAI 429, falling back to Gemini...`)
        try {
          content = await generateWithGemini(userPrompt)
        } catch (geminiError) {
          console.error(`${LOG_PREFIX} Gemini fallback failed:`, geminiError)
        }
      } else {
        console.error(`${LOG_PREFIX} OpenAI failed (not 429):`, error)
      }
    }
  }

  if (!content) {
    console.warn(`${LOG_PREFIX} content generation failed or empty`)
    await updateStatus(ds, candidateId, electionName, null)
    return
  }

  try {
    await ds.query(
      `
        UPDATE MANIFESTO
           SET content = $1,
               content_format = 'html',
               status = $2,
               candidate_name = $3
         WHERE candidate_id = $4
           AND election_name = $5
      `,
      [content, "COMPLETE", candidateName, candidateId, electionName]
    )
  } catch (dbError) {
    console.error(`${LOG_PREFIX} DB update failed`, dbError)
    await updateStatus(ds, candidateId, electionName, null)
  }
}

async function generateWithOpenAI(
  prompt: string
): Promise<string | undefined> {
  const apiKey =
    process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY || undefined
  if (!apiKey) {
    console.warn(`${LOG_PREFIX} OpenAI skipped (missing API key)`)
    return undefined
  }

  const client = new OpenAI({ apiKey, maxRetries: 2 }) // Lower retries since we have fallback
  const response = await client.responses.create({
    model: "gpt-5",
    reasoning: { effort: "medium" },
    tools: [{ type: "web_search_preview" }],
    input: prompt,
  })

  return response.output_text?.trim()
}

async function generateWithGemini(
  prompt: string
): Promise<string | undefined> {
  // console.warn(process.env) // Reduce noise
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.warn(`${LOG_PREFIX} Gemini skipped (missing API key)`)
    return undefined
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    tools: [{ googleSearchRetrieval: {} }],
  })

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

async function ensureManifestoRow(
  ds: Awaited<ReturnType<typeof getDataSource>>,
  params: {
    candidateId: number
    electionName: string
    candidateName: string
    status: ManifestoStatus
  }
) {
  const { candidateId, electionName, candidateName, status } = params
  // Placeholder content must be non-null if column is not nullable, 
  // currently schema might allow null or we use a loading string.
  // Using a simple loading indicator compatible with HTML format.
  const PLACEHOLDER_CONTENT = "<ul><li>作成中...</li></ul>" 

  await ds.query(
    `
      INSERT INTO MANIFESTO (
        candidate_id,
        candidate_name,
        election_name,
        content,
        content_format,
        status
      )
      VALUES ($1, $2, $3, $4, 'html', $5)
      ON CONFLICT (candidate_id, election_name)
      DO UPDATE SET
        candidate_name = EXCLUDED.candidate_name,
        status = EXCLUDED.status
    `,
    [candidateId, candidateName, electionName, PLACEHOLDER_CONTENT, status]
  )
}

async function updateStatus(
  ds: Awaited<ReturnType<typeof getDataSource>>,
  candidateId: number,
  electionName: string,
  status: ManifestoStatus | null
) {
  await ds.query(
    `
      UPDATE MANIFESTO
         SET status = $3
       WHERE candidate_id = $1
         AND election_name = $2
    `,
    [candidateId, electionName, status]
  )
}

