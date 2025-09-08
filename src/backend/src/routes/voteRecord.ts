import { Router } from "express"
import { getDataSource } from "../data-source"

const router = Router()

// 投票記録一覧取得
router.get("/", async (_req, res) => {
  try {
    const ds = await getDataSource()
    const rows = await ds.query(`
      SELECT vr.vote_id, vr.vote_date, vr.photo_url, vr.social_post_url, vr.user_id, vr.election_id, vr.candidate_name
      FROM VOTE_RECORD vr
      ORDER BY vr.vote_id DESC
    `)
    return res.json(rows)
  } catch (e) {
    console.error("Failed to fetch vote records:", e)
    return res.status(500).json({ message: "Internal server error" })
  }
})

// 投票記録新規作成
router.post("/", async (req, res) => {
  try {
    const ds = await getDataSource()
    const {
      vote_date,
      election_id,
      election_type_id,
      election_name,
      candidate_name,
      photo_url,
      social_post_url,
      notes,
    } = req.body

    // validation: require vote_date
    if (!vote_date) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    if (!election_id && !(election_type_id && election_name)) {
      return res.status(400).json({
        message:
          "Missing election info: provide election_id or both election_type_id and election_name",
      })
    }

    // Determine election_id to use: prefer provided election_id; otherwise create a new ELECTION
    let usedElectionId = election_id
    if (!usedElectionId) {
      // ensure provided election_type_id exists to avoid FK violation
      const etRows = await ds.query(
        `SELECT election_type_id FROM ELECTION_TYPE WHERE election_type_id = $1`,
        [election_type_id]
      )
      if (!etRows || etRows.length === 0) {
        return res.status(400).json({ message: "Invalid election_type_id" })
      }

      const insertElection = await ds.query(
        `INSERT INTO ELECTION (name, date, election_type_id) VALUES ($1, $2, $3) RETURNING election_id`,
        [election_name, vote_date, election_type_id]
      )
      usedElectionId = insertElection[0].election_id
    }

    // TODO: Replace with authenticated user id when auth is available
    const userId = 1

    const insertVote = await ds.query(
      `INSERT INTO VOTE_RECORD (user_id, election_id, candidate_name, vote_date, social_post_url, photo_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING vote_id`,
      [
        userId,
        usedElectionId,
        candidate_name,
        vote_date,
        social_post_url || null,
        photo_url || null,
      ]
    )
    const voteId = insertVote[0].vote_id

    return res.status(201).json({ vote_id: voteId })
  } catch (e) {
    console.error("Failed to create vote record:", e)
    return res.status(500).json({ message: "Failed to create vote record" })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const ds = await getDataSource()
    const { id } = req.params

    const rows = await ds.query(
      `
      SELECT vr.vote_id, vr.vote_date, vr.photo_url, vr.social_post_url, vr.user_id, vr.election_id, vr.candidate_name,
             e.name AS election_name, e.date AS election_date, et.name AS election_type_name
      FROM VOTE_RECORD vr
      LEFT JOIN ELECTION e ON vr.election_id = e.election_id
      LEFT JOIN ELECTION_TYPE et ON e.election_type_id = et.election_type_id
      WHERE vr.vote_id = $1
      `,
      [id]
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
