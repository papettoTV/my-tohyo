import { Router } from "express"
import { getDataSource } from "../data-source"
import { authenticateJWT } from "../middleware/auth"
import { scheduleManifestoAutoUpdate } from "../services/manifestoAutoUpdater"

const router = Router()

function extractUserId(tokenUser: any): number | null {
  if (!tokenUser) return null
  const candidates = [tokenUser.user_id, tokenUser.id]
  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate
    }
    if (typeof candidate === "string") {
      const num = Number(candidate)
      if (Number.isFinite(num)) {
        return num
      }
    }
  }
  return null
}

// 投票記録一覧取得
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const ds = await getDataSource()
    // @ts-ignore
    const tokenUser = req.user as any
    const userId = extractUserId(tokenUser)
    if (userId === null) {
      return res.status(400).json({ message: "Invalid user context" })
    }

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
             COALESCE(vr.party_name, p.name) AS party_name,
             c.candidate_id,
             c.party_id,
             et.name AS election_type_name
      FROM VOTE_RECORD vr
      LEFT JOIN ELECTION_TYPE et ON vr.election_type_id = et.election_type_id
      LEFT JOIN CANDIDATE c ON LOWER(c.name) = LOWER(vr.candidate_name)
      LEFT JOIN PARTY p ON p.party_id = c.party_id
      WHERE vr.user_id = $1
      ORDER BY vr.vote_id DESC
    `,
      [userId]
    )
    return res.json(rows)
  } catch (e) {
    console.error("Failed to fetch vote records:", e)
    return res.status(500).json({ message: "Internal server error" })
  }
})

// 投票記録新規作成
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const ds = await getDataSource()
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
    } = req.body

    // validation: require vote_date
    if (!vote_date) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const normalizedCandidateName =
      typeof candidate_name === "string" ? candidate_name.trim() : ""
    if (!normalizedCandidateName) {
      return res.status(400).json({ message: "candidate_name is required" })
    }

    const normalizedElectionName =
      typeof election_name === "string" ? election_name.trim() : ""
    if (!normalizedElectionName) {
      return res.status(400).json({ message: "election_name is required" })
    }

    const normalizedElectionTypeId = Number(election_type_id)
    if (
      Number.isNaN(normalizedElectionTypeId) ||
      !Number.isFinite(normalizedElectionTypeId)
    ) {
      return res.status(400).json({ message: "Invalid election_type_id" })
    }

    const etRows = await ds.query(
      `SELECT election_type_id, name FROM ELECTION_TYPE WHERE election_type_id = $1`,
      [normalizedElectionTypeId]
    )
    if (!etRows || etRows.length === 0) {
      return res.status(400).json({ message: "Invalid election_type_id" })
    }
    const electionTypeName: string | null = etRows[0]?.name || null

    const normalizedPartyId =
      party_id === undefined || party_id === null ? null : Number(party_id)
    let normalizedPartyName =
      typeof party_name === "string" && party_name.trim() !== ""
        ? party_name.trim()
        : null
    if (
      normalizedPartyId !== null &&
      (Number.isNaN(normalizedPartyId) || !Number.isFinite(normalizedPartyId))
    ) {
      return res.status(400).json({ message: "Invalid party_id" })
    }

    if (normalizedPartyId !== null) {
      const partyRows = await ds.query(
        `SELECT party_id, name FROM PARTY WHERE party_id = $1`,
        [normalizedPartyId]
      )
      if (!partyRows || partyRows.length === 0) {
        return res.status(400).json({ message: "Invalid party_id" })
      }
      if (!normalizedPartyName) {
        normalizedPartyName = partyRows[0].name || null
      }
    }

    // Ensure candidate master exists and reflects latest party information
    const candidateRows = await ds.query(
      `SELECT candidate_id, party_id, name FROM CANDIDATE WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [normalizedCandidateName]
    )
    let candidateId: number
    let canonicalCandidateName = normalizedCandidateName

    if (candidateRows && candidateRows.length > 0) {
      const existing = candidateRows[0]
      candidateId = existing.candidate_id
      if (existing.name) {
        canonicalCandidateName = existing.name
      }
      if (
        normalizedPartyId !== null &&
        existing.party_id !== normalizedPartyId
      ) {
        await ds.query(
          `UPDATE CANDIDATE SET party_id = $1 WHERE candidate_id = $2`,
          [normalizedPartyId, candidateId]
        )
      }
    } else {
      const inserted = await ds.query(
        `INSERT INTO CANDIDATE (name, party_id, manifesto_url, achievements) VALUES ($1, $2, NULL, NULL)
         RETURNING candidate_id, name`,
        [normalizedCandidateName, normalizedPartyId]
      )
      candidateId = inserted[0].candidate_id
      if (inserted[0]?.name) {
        canonicalCandidateName = inserted[0].name
      }
    }

    // @ts-ignore
    const tokenUser = req.user as any
    const userId = extractUserId(tokenUser)

    if (userId === null) {
      return res.status(400).json({ message: "Invalid user context" })
    }

    const insertVote = await ds.query(
      `INSERT INTO VOTE_RECORD (
         user_id,
         candidate_name,
         election_name,
         election_type_id,
         vote_date,
         party_name,
         social_post_url,
         photo_url,
         notes
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING vote_id`,
      [
        userId,
        normalizedCandidateName,
        normalizedElectionName,
        normalizedElectionTypeId,
        vote_date,
        normalizedPartyName,
        social_post_url || null,
        photo_url || null,
        notes || null,
      ]
    )
    const voteId = insertVote[0].vote_id

    scheduleManifestoAutoUpdate({
      candidateId,
      candidateName: canonicalCandidateName,
      electionName: normalizedElectionName,
      partyName: normalizedPartyName,
      electionTypeName,
      voteDate: vote_date,
    })

    return res.status(201).json({ vote_id: voteId })
  } catch (e) {
    console.error("Failed to create vote record:", e)
    return res.status(500).json({ message: "Failed to create vote record" })
  }
})

router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const ds = await getDataSource()
    const { id } = req.params
    // @ts-ignore
    const tokenUser = req.user as any
    const userId = extractUserId(tokenUser)
    if (userId === null) {
      return res.status(400).json({ message: "Invalid user context" })
    }

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
             COALESCE(vr.party_name, p.name) AS party_name,
             c.candidate_id,
             c.party_id,
             et.name AS election_type_name,
             m.manifesto_id,
             m.candidate_id AS manifesto_candidate_id,
             m.content AS manifesto_content,
             m.content_format AS manifesto_content_format,
             m.status AS manifesto_status,
             c.achievements
      FROM VOTE_RECORD vr
      LEFT JOIN ELECTION_TYPE et ON vr.election_type_id = et.election_type_id
      LEFT JOIN CANDIDATE c ON LOWER(c.name) = LOWER(vr.candidate_name)
      LEFT JOIN PARTY p ON p.party_id = c.party_id
      LEFT JOIN MANIFESTO m
        ON m.candidate_id = c.candidate_id
       AND LOWER(m.election_name) = LOWER(vr.election_name)
      WHERE vr.vote_id = $1 AND vr.user_id = $2
      `,
      [id, userId]
    )

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Vote record not found" })
    }

    const [record] = rows
    const {
      manifesto_id: manifestoId,
      manifesto_candidate_id: manifestoCandidateId,
      manifesto_content: manifestoContent,
      manifesto_content_format: manifestoContentFormat,
      manifesto_status: manifestoStatus,
      achievements,
      ...rest
    } = record

    const manifesto =
      manifestoId !== null && manifestoId !== undefined
        ? {
            manifesto_id: manifestoId,
            election_name: rest.election_name,
            candidate_name: rest.candidate_name,
            candidate_id: manifestoCandidateId ?? null,
            content: manifestoContent,
            content_format: manifestoContentFormat || "markdown",
            status: manifestoStatus ?? null,
          }
        : null

    return res.json({
      ...rest,
      manifesto,
      achievements: achievements || null,
    })
  } catch (e) {
    console.error("Failed to fetch vote record:", e)
    return res.status(500).json({ message: "Internal server error" })
  }
})

export default router
