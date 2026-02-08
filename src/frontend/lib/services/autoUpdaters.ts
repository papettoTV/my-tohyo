import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getDataSource } from "@/lib/db/data-source"
import { generateManifestoPrompt } from "@/lib/prompts/manifestoTemplate"
import { generateAchievementPrompt } from "@/lib/prompts/achievementTemplate"

type AutoUpdatePayload = {
  candidateId: number
  candidateName: string
  electionName: string
  partyName?: string | null
  electionTypeName?: string | null
  voteDate?: string | null
}

const LOG_PREFIX_M = "[manifesto-auto-update]"
const LOG_PREFIX_A = "[achievement-auto-update]"

export function scheduleAutoUpdates(payload: AutoUpdatePayload) {
  // In Next.js/Vercel, we can try to fire and forget
  // but better to handle errors
  autoUpdateManifesto(payload).catch(err => console.error(`${LOG_PREFIX_M} failed:`, err))
  autoUpdateAchievement(payload).catch(err => console.error(`${LOG_PREFIX_A} failed:`, err))
}

async function autoUpdateManifesto(payload: AutoUpdatePayload) {
  const { candidateId, candidateName, electionName } = payload
  const ds = await getDataSource()
  const partyId = await fetchCandidatePartyId(ds, candidateId)

  await ds.query(
    `INSERT INTO CANDIDATE_CONTENT (type, candidate_id, party_id, candidate_name, election_name, content, content_format, status)
     VALUES ('manifesto', $1, $2, $3, $4, '<ul><li>作成中...</li></ul>', 'html', 'PROGRESS')
     ON CONFLICT (candidate_id, party_id, election_name, type) DO UPDATE SET status = 'PROGRESS'`,
    [candidateId, partyId, candidateName, electionName]
  )

  const derivedYear = electionName.match(/(20\d{2})/)?.[1] || new Date().getFullYear().toString()
  const today = new Date().toISOString().slice(0, 10)

  const userPrompt = generateManifestoPrompt({
    candidate: candidateName,
    election: electionName,
    derivedYear,
    derivedDistrict: "不明",
    derivedParty: payload.partyName || "無所属",
    source1: "{{URL1}}",
    source2: "{{URL2}}",
    source3: "{{URL3}}",
    today,
  })

  let content: string | undefined
  if (process.env.CALL_PROMPT_FLG === "true") {
    content = await generateContent(userPrompt)
  } else {
    content = "<ul><li>作成中 (ダミー)...</li></ul>"
  }

  if (content) {
    await ds.query(
      `UPDATE CANDIDATE_CONTENT SET content = $1, status = 'COMPLETE' WHERE candidate_id = $2 AND election_name = $3 AND type = 'manifesto'`,
      [content, candidateId, electionName]
    )
  }
}

async function autoUpdateAchievement(payload: AutoUpdatePayload) {
  const { candidateId, candidateName, electionName, voteDate } = payload
  const ds = await getDataSource()
  const partyId = await fetchCandidatePartyId(ds, candidateId)

  const userPrompt = generateAchievementPrompt({
    candidate: candidateName,
    election: electionName,
    electionType: payload.electionTypeName || "選挙種類",
    party: payload.partyName || "無所属",
    startDate: voteDate || "情報未提供",
    today: new Date().toISOString().slice(0, 10),
  })

  let content: string | undefined
  if (process.env.CALL_PROMPT_FLG === "true") {
    content = await generateContent(userPrompt)
  }

  if (content) {
    await ds.query(
      `INSERT INTO CANDIDATE_CONTENT (type, candidate_id, party_id, candidate_name, election_name, content, content_format)
       VALUES ('achievement', $1, $2, $3, $4, $5, 'html')
       ON CONFLICT (candidate_id, party_id, election_name, type) DO UPDATE SET content = EXCLUDED.content`,
      [candidateId, partyId, candidateName, electionName, content]
    )
  }
}

async function generateContent(prompt: string): Promise<string | undefined> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return undefined

  try {
    const client = new OpenAI({ apiKey })
    const response = await client.chat.completions.create({
      model: (process.env.OPENAI_MODEL || "gpt-5") as any,
      messages: [{ role: "user", content: prompt }],
    })
    return response.choices[0].message.content?.trim()
  } catch (error: any) {
    if (error?.status === 429 && process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp" })
      const result = await model.generateContent(prompt)
      return result.response.text()
    }
    throw error
  }
}

async function fetchCandidatePartyId(ds: any, candidateId: number): Promise<number | null> {
  const rows = await ds.query(`SELECT party_id FROM CANDIDATE WHERE candidate_id = $1`, [candidateId])
  return rows?.[0]?.party_id ?? null
}
