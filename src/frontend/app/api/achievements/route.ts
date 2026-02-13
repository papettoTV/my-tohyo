import { NextRequest, NextResponse } from "next/server"
import { getDataSource } from "@/lib/db/data-source"
import { verifyAuth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const {
      candidate_name,
      election_name,
      content,
      party_name,
      party_id: partyIdFromReq,
    } = await req.json()

    const candidate = candidate_name?.trim() || null
    const election = election_name?.trim()
    const body = content?.trim()
    const partyId = partyIdFromReq || null

    if (!election || !body || (!candidate && !partyId && !party_name)) {
      return NextResponse.json({ message: "必須項目が不足しています" }, { status: 400 })
    }

    const ds = await getDataSource()

    let candidateId: number | null = null
    let canonicalCandidateName: string = candidate || party_name || "不明"

    if (candidate) {
      // Check existing achievements
      const rows = await ds.query(
        `SELECT content FROM CANDIDATE_CONTENT
         WHERE candidate_name = $1 AND election_name = $2 AND type = 'achievement' LIMIT 1`,
        [candidate, election]
      )

      if (rows && rows.length > 0) {
        return NextResponse.json({
          candidate_id: null,
          candidate_name: candidate,
          election_name: election,
          achievements: rows[0].content
        })
      }

      const candidateRows = await ds.query(
        `SELECT candidate_id, name FROM CANDIDATE WHERE LOWER(name) = LOWER($1) LIMIT 1`,
        [candidate]
      )

      if (candidateRows && candidateRows.length > 0) {
        candidateId = candidateRows[0].candidate_id
        canonicalCandidateName = candidateRows[0].name
      } else {
        const inserted = await ds.query(
          `INSERT INTO CANDIDATE (name, party_id, manifesto_url, achievements) VALUES ($1, NULL, NULL, NULL)
           RETURNING candidate_id, name`,
          [candidate]
        )
        candidateId = inserted[0].candidate_id
        canonicalCandidateName = inserted[0].name
      }
    }

    let finalPartyId: number | null = partyId
    if (!finalPartyId && party_name) {
      const partyRows = await ds.query(
        `SELECT party_id FROM PARTY WHERE LOWER(name) = LOWER($1) LIMIT 1`,
        [party_name]
      )
      if (partyRows && partyRows.length > 0) {
        finalPartyId = partyRows[0].party_id
      }
    }

    // Upsert achievement
    await ds.query(
      `
        INSERT INTO CANDIDATE_CONTENT (type, candidate_id, party_id, candidate_name, election_name, content, content_format)
        VALUES ('achievement', $1, $2, $3, $4, $5, 'html')
        ON CONFLICT (candidate_id, party_id, election_name, type)
        DO UPDATE SET
          candidate_name = EXCLUDED.candidate_name,
          content = EXCLUDED.content,
          content_format = EXCLUDED.content_format
      `,
      [candidateId, finalPartyId, canonicalCandidateName, election, body]
    )

    return NextResponse.json({
      candidate_id: candidateId,
      candidate_name: canonicalCandidateName,
      election_name: election,
      achievements: body
    })

  } catch (error) {
    console.error("[api/achievements] failed:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
