import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { verifyAuth } from "@/lib/auth"
import { generateManifestoPrompt } from "@/lib/prompts/manifestoTemplate"

export async function POST(req: NextRequest) {
  try {
    const user = verifyAuth(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const {
      candidate_name,
      election_name,
      election_year,
      election_district,
      party_name,
      source_urls,
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

    const sanitize = (value?: any, fallback = "情報未提供") => {
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

    const userPrompt = generateManifestoPrompt({
      candidate: candidate as string,
      election: sanitize(election, "第27回参議院議員通常選挙") as string,
      derivedYear,
      derivedDistrict,
      derivedParty,
      source1,
      source2,
      source3,
      today,
    })

    let content: string | undefined

    if (process.env.CALL_PROMPT_FLG !== "true") {
      content = `
        <section>
          <h3 class="text-lg font-bold mb-2">マニフェスト (ダミー)</h3>
          <p>これはダミーのマニフェストデータです。</p>
        </section>
      `
    } else {
      try {
        const client = new OpenAI({ apiKey })
        // Note: Using gpt-4o as gpt-5 is not available yet in reality
        // but keeping gpt-5 if specified by user in env
        const model = process.env.OPENAI_MODEL || "gpt-5"
        
        // Handling the specialized tool call for web search if supported
        // Adjusting based on standard OpenAI SDK for now
        const response = await client.chat.completions.create({
          model: model as any,
          messages: [{ role: "user", content: userPrompt }],
          // @ts-ignore
          // tools: [{ type: "web_search_preview" }], // If using preview features
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
    console.error("[api/manifestos/auto-generate] failed:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
