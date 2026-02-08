import { NextRequest, NextResponse } from "next/server"
import { getDataSource } from "@/lib/db/data-source"
import { verifyAuth } from "@/lib/auth"
import { CandidateContent, ManifestoStatus } from "@/lib/db/models/CandidateContent"

export async function POST(req: NextRequest) {
  try {
    const user = verifyAuth(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const {
      candidate_name,
      election_name,
      content,
      content_format,
      status: requestedStatus,
      party_name,
    } = await req.json()

    // Adapted from backend/src/routes/manifesto.ts
    const candidate = candidate_name?.trim() || null
    const election = election_name?.trim()
    const body = content?.trim()
    const format = (content_format || "html").trim().toLowerCase()
    const partyIdFromReq = (req as any).party_id || null // This might need adjustment if it was in the body
    const partyNameFromReq = party_name?.trim() || null

    if (!election || !body || (!candidate && !partyIdFromReq && !partyNameFromReq)) {
      return NextResponse.json(
        { message: "候補者名または政党情報、選挙名、本文は必須です" },
        { status: 400 }
      )
    }

    if (format !== "markdown" && format !== "html") {
      return NextResponse.json({ message: "content_format が不正です" }, { status: 400 })
    }

    let status: ManifestoStatus | null = null
    if (requestedStatus !== undefined && requestedStatus !== null) {
      const normalizedStatus = String(requestedStatus).trim().toUpperCase()
      const allowed: ManifestoStatus[] = ["PROGRESS", "COMPLETE"]
      if (!allowed.includes(normalizedStatus as ManifestoStatus)) {
        return NextResponse.json({ message: "status が不正です" }, { status: 400 })
      }
      status = normalizedStatus as ManifestoStatus
    }

    const ds = await getDataSource()

    let candidateId: number | null = null
    let canonicalCandidateName: string = candidate || partyNameFromReq || "不明"

    if (candidate) {
      const existingCandidateRows = await ds.query(
        `SELECT candidate_id, name FROM CANDIDATE WHERE LOWER(name) = LOWER($1) LIMIT 1`,
        [candidate]
      )

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
    }

    let partyId: number | null = partyIdFromReq
    if (!partyId && partyNameFromReq) {
      const partyRows = await ds.query(
        `SELECT party_id FROM PARTY WHERE LOWER(name) = LOWER($1) LIMIT 1`,
        [partyNameFromReq]
      )
      if (partyRows && partyRows.length > 0) {
        partyId = partyRows[0].party_id
      }
    }

    // 既存データの検索
    const existingContentRows = await ds.query(
      `SELECT cc.content, cc.status FROM CANDIDATE_CONTENT cc
       WHERE cc.candidate_name = $1 AND cc.election_name = $2 AND cc.type = 'manifesto'`,
      [candidate, election]
    )

    if (existingContentRows && existingContentRows.length > 0) {
      return NextResponse.json({
        content: existingContentRows[0].content,
        status: existingContentRows[0].status,
      })
    }

    const rows = await ds.query(
      `
        INSERT INTO CANDIDATE_CONTENT (type, candidate_id, party_id, candidate_name, election_name, content, content_format, status)
        VALUES ('manifesto', $1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (candidate_id, party_id, election_name, type)
        DO UPDATE SET candidate_name = EXCLUDED.candidate_name, content = EXCLUDED.content, content_format = EXCLUDED.content_format, status = EXCLUDED.status
        RETURNING content_id, status
      `,
      [candidateId, partyId, canonicalCandidateName, election, body, format, status]
    )

    return NextResponse.json({
      content_id: rows?.[0]?.content_id,
      candidate_id: candidateId,
      candidate_name: canonicalCandidateName,
      election_name: election,
      content: body,
      content_format: format,
      status: rows?.[0]?.status ?? status ?? null,
    }, { status: 201 })

  } catch (error) {
    console.error("[api/manifestos] failed:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
