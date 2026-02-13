import { NextRequest, NextResponse } from "next/server"
import { getDataSource } from "@/lib/db/data-source"
import { verifyAuth } from "@/lib/auth"
import { scheduleAutoUpdates } from "@/lib/services/autoUpdaters"

function extractUserId(user: any): number | null {
  if (!user) return null
  const id = user.user_id || user.id
  return typeof id === "number" ? id : (id ? Number(id) : null)
}

export async function GET(req: NextRequest) {
  try {
    const user = verifyAuth(req)
    const userId = extractUserId(user)
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const ds = await getDataSource()
    const rows = await ds.query(
      `
      SELECT vr.vote_id,
             vr.vote_date,
             vr.photo_url,
             vr.social_post_url,
             vr.user_id,
             vr.candidate_name,
             vr.election_name,
             vr.election_type_id,
             vr.notes,
             COALESCE(p_vote.name, p.name) AS party_name,
             vr.party_id,
             c.candidate_id,
             et.name AS election_type_name
      FROM VOTE_RECORD vr
      LEFT JOIN ELECTION_TYPE et ON vr.election_type_id = et.election_type_id
      LEFT JOIN CANDIDATE c ON LOWER(c.name) = LOWER(vr.candidate_name)
      LEFT JOIN PARTY p ON p.party_id = c.party_id
      LEFT JOIN PARTY p_vote ON p_vote.party_id = vr.party_id
      WHERE vr.user_id = $1
      ORDER BY vr.vote_id DESC
      `,
      [userId]
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error("GET /api/vote-records failed:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = verifyAuth(req)
    const userId = extractUserId(user)
    console.log("POST /api/vote-records - userId:", userId)
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const {
      vote_date,
      election_type_id,
      election_name,
      candidate_name,
      photo_url,
      social_post_url,
      notes,
      party_id,
      party_name,
    } = await req.json()

    if (!vote_date || !election_name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const ds = await getDataSource()
    
    // Normalize and Fetch additional info
    const etRows = await ds.query(`SELECT name FROM ELECTION_TYPE WHERE election_type_id = $1`, [election_type_id])
    const electionTypeName = etRows?.[0]?.name || null

    let candidateId: number | null = null
    let canonicalCandidateName = candidate_name?.trim() || ""

    if (canonicalCandidateName) {
      const candidateRows = await ds.query(`SELECT candidate_id, name FROM CANDIDATE WHERE LOWER(name) = LOWER($1) LIMIT 1`, [canonicalCandidateName])
      if (candidateRows?.length > 0) {
        candidateId = candidateRows[0].candidate_id
        canonicalCandidateName = candidateRows[0].name
      } else {
        const result = await ds.query(`INSERT INTO CANDIDATE (name, party_id) VALUES ($1, $2) RETURNING candidate_id`, [canonicalCandidateName, party_id || null])
        candidateId = result[0].candidate_id
      }
    }

    const insertResult = await ds.query(
      `INSERT INTO VOTE_RECORD (user_id, candidate_name, election_name, election_type_id, vote_date, party_id, social_post_url, photo_url, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING vote_id`,
      [userId, canonicalCandidateName, election_name, election_type_id, vote_date, party_id || null, social_post_url || null, photo_url || null, notes || null]
    )

    if (candidateId) {
      scheduleAutoUpdates({
        candidateId,
        candidateName: canonicalCandidateName,
        electionName: election_name,
        partyName: party_name,
        electionTypeName,
        voteDate: vote_date,
      })
    }

    return NextResponse.json({ vote_id: insertResult[0].vote_id }, { status: 201 })
  } catch (error) {
    console.error("POST /api/vote-records failed:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
