import { Router } from "express"
import { getDataSource } from "../data-source"
import { authenticateJWT } from "../middleware/auth"

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
      `SELECT election_type_id FROM ELECTION_TYPE WHERE election_type_id = $1`,
      [normalizedElectionTypeId]
    )
    if (!etRows || etRows.length === 0) {
      return res.status(400).json({ message: "Invalid election_type_id" })
    }

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

    // Ensure candidate master is aligned when party information is provided
    if (normalizedPartyId !== null) {
      const candidateRows = await ds.query(
        `SELECT candidate_id, party_id FROM CANDIDATE WHERE LOWER(name) = LOWER($1) LIMIT 1`,
        [normalizedCandidateName]
      )

      if (candidateRows && candidateRows.length > 0) {
        const existing = candidateRows[0]
        if (existing.party_id !== normalizedPartyId) {
          await ds.query(
            `UPDATE CANDIDATE SET party_id = $1 WHERE candidate_id = $2`,
            [normalizedPartyId, existing.candidate_id]
          )
        }
      } else {
        await ds.query(
          `INSERT INTO CANDIDATE (name, party_id, manifesto_url, achievements) VALUES ($1, $2, NULL, NULL)`,
          [normalizedCandidateName, normalizedPartyId]
        )
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
             c.party_id,
             et.name AS election_type_name
      FROM VOTE_RECORD vr
      LEFT JOIN ELECTION_TYPE et ON vr.election_type_id = et.election_type_id
      LEFT JOIN CANDIDATE c ON LOWER(c.name) = LOWER(vr.candidate_name)
      LEFT JOIN PARTY p ON p.party_id = c.party_id
      WHERE vr.vote_id = $1 AND vr.user_id = $2
      `,
      [id, userId]
    )

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Vote record not found" })
    }

    return res.json(rows[0])
  } catch (e) {
    console.error("Failed to fetch vote record:", e)
    return res.status(500).json({ message: "Internal server error" })
  }
})

export default router
