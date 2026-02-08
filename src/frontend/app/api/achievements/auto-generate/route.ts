import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { verifyAuth } from "@/lib/auth"
import { generateAchievementPrompt } from "@/lib/prompts/achievementTemplate"

export async function POST(req: NextRequest) {
  try {
    const user = verifyAuth(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const {
      candidate_name,
      election_name,
      election_type_name,
      vote_date,
      party_name,
    } = await req.json()

    const candidate = candidate_name?.trim()
    const election = election_name?.trim()

    if (!election || (!candidate && !party_name)) {
      return NextResponse.json(
        { message: "election_name と candidate_name または party_name は必須です" },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY || ""
    if (!apiKey && process.env.CALL_PROMPT_FLG === "true") {
      return NextResponse.json({ message: "OpenAI API key が設定されていません" }, { status: 400 })
    }

    const sanitize = (val?: string | null, def = "情報未提供") =>
      (val && val.trim() !== "") ? val.trim() : def
    
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

    let content: string | undefined

    if (process.env.CALL_PROMPT_FLG !== "true") {
      content = `
        <ul>
          <li>タイトル：${candidate} / 実績・活動 (ダミー)</li>
          <li>要約：<ul><li>これはダミーの実績データです。</li></ul></li>
        </ul>
      `
    } else {
      try {
        const client = new OpenAI({ apiKey })
        const model = process.env.OPENAI_MODEL || "gpt-5"
        
        // Note: Backend used 'responses.create' which is likely a preview/custom method
        // Standard SDK uses chat.completions.create
        const response = await client.chat.completions.create({
          model: model as any,
          messages: [{ role: "user", content: userPrompt }],
        })
        content = response.choices[0].message.content?.trim()
      } catch (error: any) {
        if (error?.status === 429) {
          const geminiKey = process.env.GEMINI_API_KEY
          if (geminiKey) {
            try {
              const genAI = new GoogleGenerativeAI(geminiKey)
              const model = genAI.getGenerativeModel({
                model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
              })
              const result = await model.generateContent(userPrompt)
              const response = await result.response
              content = response.text()
            } catch (geminiError) {
              console.error("Gemini fallback failed:", geminiError)
              throw error 
            }
          } else {
            throw error
          }
        } else {
          throw error
        }
      }
    }

    if (!content) {
      return NextResponse.json({ message: "生成結果を取得できませんでした" }, { status: 502 })
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error("[api/achievements/auto-generate] failed:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
