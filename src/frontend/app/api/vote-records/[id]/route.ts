import { NextRequest, NextResponse } from "next/server"
import { getDataSource } from "@/lib/db/data-source"
import { verifyAuth } from "@/lib/auth"

function extractUserId(user: any): number | null {
  if (!user) return null
  const id = user.user_id || user.id
  return typeof id === "number" ? id : (id ? Number(id) : null)
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await verifyAuth(req)
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
             et.name AS election_type_name,
             m.content_id AS manifesto_content_id,
             m.candidate_id AS manifesto_candidate_id,
             m.content AS manifesto_content,
             m.status AS manifesto_status,
             a.content_id AS achievement_content_id,
             a.content AS achievement_content,
             a.updated_at AS achievement_updated_at
      FROM VOTE_RECORD vr
      LEFT JOIN ELECTION_TYPE et ON vr.election_type_id = et.election_type_id
      LEFT JOIN CANDIDATE c ON LOWER(c.name) = LOWER(vr.candidate_name)
      LEFT JOIN PARTY p ON p.party_id = c.party_id
      LEFT JOIN PARTY p_vote ON p_vote.party_id = vr.party_id
      LEFT JOIN CANDIDATE_CONTENT m
        ON (m.candidate_id = c.candidate_id OR (vr.candidate_name IS NULL AND m.party_id = vr.party_id))
       AND LOWER(m.election_name) = LOWER(vr.election_name)
       AND m.type = 'manifesto'
      LEFT JOIN CANDIDATE_CONTENT a
        ON (a.candidate_id = c.candidate_id OR (vr.candidate_name IS NULL AND a.party_id = vr.party_id))
       AND LOWER(a.election_name) = LOWER(vr.election_name)
       AND a.type = 'achievement'
      WHERE vr.vote_id = $1 AND vr.user_id = $2
      `,
      [id, userId]
    )

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Vote record not found" }, { status: 404 })
    }

    const [record] = rows
    const {
      manifesto_content_id,
      manifesto_content,
      manifesto_status,
      achievement_content_id,
      achievement_content,
      achievement_updated_at,
      ...rest
    } = record

    return NextResponse.json({
      ...rest,
      manifesto: manifesto_content_id ? {
        content_id: manifesto_content_id,
        content: manifesto_content,
        status: manifesto_status,
      } : null,
      achievement: achievement_content_id ? {
        content_id: achievement_content_id,
        content: achievement_content,
        updated_at: achievement_updated_at,
      } : null,
    })
  } catch (error) {
    console.error("GET /api/vote-records/[id] failed:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await verifyAuth(req)
    const userId = extractUserId(user)
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const ds = await getDataSource()
    const check = await ds.query(
      `SELECT vote_id FROM VOTE_RECORD WHERE vote_id = $1 AND user_id = $2`,
      [id, userId]
    )

    if (!check || check.length === 0) {
      return NextResponse.json({ message: "Vote record not found or not authorized" }, { status: 404 })
    }

    await ds.query(`DELETE FROM VOTE_RECORD WHERE vote_id = $1`, [id])
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("DELETE /api/vote-records/[id] failed:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
