import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getDataSource } from "../data-source"
import { generateAchievementPrompt } from "../prompts/achievementTemplate"

type AutoUpdatePayload = {
  candidateId: number
  candidateName: string
  electionName: string
  partyName?: string | null
  electionTypeName?: string | null
  voteDate?: string | null
}

const LOG_PREFIX = "[achievement-auto-update]"

export function scheduleAchievementAutoUpdate(payload: AutoUpdatePayload) {
  // 0ms timeout keeps the HTTP response snappy while we process in background
  setTimeout(() => {
    autoUpdateAchievement(payload).catch((error) => {
      console.error(`${LOG_PREFIX} failed:`, error)
    })
  }, 0)
}

async function autoUpdateAchievement(payload: AutoUpdatePayload) {
  const { candidateId, candidateName, electionName, voteDate, partyName, electionTypeName } = payload
  const ds = await getDataSource()

  // 1. Check if achievement already exists for this candidate/election
  const existingRows = await ds.query(
    `SELECT achievement_id, content FROM ACHIEVEMENT WHERE candidate_id = $1 AND election_name = $2`,
    [candidateId, electionName]
  )

  if (existingRows && existingRows.length > 0) {
    // Already exists. If content is present, we skip.
    // If content is null/empty, we might want to regenerate, but for now we assume existence = done
    const row = existingRows[0]
    if (row.content && row.content.trim().length > 0) {
      console.log(`${LOG_PREFIX} Achievement already exists for candidateId=${candidateId}, election=${electionName}. Skipping generation.`)
      return
    }
  }

  console.log(`${LOG_PREFIX} Generating achievement for candidateId=${candidateId}...`)

  let content: string | undefined

  // Feature Flag Check
  if (process.env.CALL_PROMPT_FLG !== "true") {
    console.log(`${LOG_PREFIX} CALL_PROMPT_FLG is not true. Using dummy data.`);
    content = `
      <ul>
        <li>タイトル：${candidateName} / 実績・活動 (ダミー)</li>
        <li>要約：<ul><li>これはダミーの実績データです。</li></ul></li>
        <li>出典：<ol><li><a href="#">ダミー出典</a></li></ol></li>
      </ul>
    `;
  } else {
    try {
      // Prepare Prompt
      const startDate = sanitizeDate(voteDate)
      const today = new Date().toISOString().slice(0, 10)
      
      // We reuse the prompt generation logic from achievementTemplate.ts
      // Note: The prompt generator expects 'candidate', 'election', etc.
      const userPrompt = generateAchievementPrompt({
        candidate: candidateName,
        election: electionName,
        electionType: electionTypeName || "選挙種類",
        party: partyName || "無所属",
        startDate,
        today,
      })

      // 2. Try OpenAI
      content = await generateWithOpenAI(userPrompt)
    } catch (error: any) {
      // 3. If 429, try Gemini
      if (error?.status === 429) {
        console.warn(`${LOG_PREFIX} OpenAI 429, falling back to Gemini...`)
        try {
          const startDate = sanitizeDate(voteDate)
          const today = new Date().toISOString().slice(0, 10)
          const userPrompt = generateAchievementPrompt({
              candidate: candidateName,
              election: electionName,
              electionType: electionTypeName || "選挙種類",
              party: partyName || "無所属",
              startDate,
              today,
          })
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
    return
  }

  // 4. Save to ACHIEVEMENT table
  try {
    await ds.query(
      `
        INSERT INTO ACHIEVEMENT (
          candidate_id,
          candidate_name,
          election_name,
          content,
          content_format
        )
        VALUES ($1, $2, $3, $4, 'html')
        ON CONFLICT (candidate_id, election_name)
        DO UPDATE SET
          candidate_name = EXCLUDED.candidate_name,
          content = EXCLUDED.content,
          content_format = EXCLUDED.content_format
      `,
      [candidateId, candidateName, electionName, content]
    )
    console.log(`${LOG_PREFIX} Achievement saved successfully.`)
  } catch (dbError) {
    console.error(`${LOG_PREFIX} DB update failed`, dbError)
  }
}

async function generateWithOpenAI(prompt: string): Promise<string | undefined> {
  const apiKey =
    process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY || undefined
  if (!apiKey) {
    console.warn(`${LOG_PREFIX} OpenAI skipped (missing API key)`)
    return undefined
  }

  // Reuse the same client config as manifestoAutoUpdater if possible, or new one
  const client = new OpenAI({ apiKey, maxRetries: 1 }) 
  const response = await client.responses.create({
    model: "gpt-5",
    reasoning: { effort: "medium" },
    tools: [{ type: "web_search_preview" }],
    input: prompt,
  })

  return response.output_text?.trim()
}

async function generateWithGemini(prompt: string): Promise<string | undefined> {
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

function sanitizeDate(value?: string | null): string {
  if (!value) return "情報未提供"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "情報未提供"
  }
  return date.toISOString().slice(0, 10)
}
