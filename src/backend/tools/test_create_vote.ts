import "reflect-metadata"
import { getDataSource } from "../src/data-source"

async function main() {
  try {
    const ds = await getDataSource()

    const payload = {
      candidate_name: "よこた",
      election_name: "テスト選挙",
      election_type_id: 3,
      notes: "テスト\nメモ",
      photo_url: null,
      vote_date: "2025-08-26",
    }

    const {
      vote_date,
      election_id,
      election_type_id,
      election_name,
      candidate_name,
      photo_url,
      notes,
    } = payload as any

    if (!vote_date) {
      console.error("Missing required vote_date")
      return
    }

    if (!election_id && !(election_type_id && election_name)) {
      console.error("Missing election info")
      return
    }

    let usedElectionId = election_id
    if (!usedElectionId) {
      // check election_type exists
      const etRows = await ds.query(
        `SELECT election_type_id FROM ELECTION_TYPE WHERE election_type_id = $1`,
        [election_type_id]
      )
      console.log("election_type rows:", etRows)
      if (!etRows || etRows.length === 0) {
        console.error("Invalid election_type_id")
        return
      }

      const insertElection = await ds.query(
        `INSERT INTO ELECTION (name, date, election_type_id) VALUES ($1, $2, $3) RETURNING election_id`,
        [election_name, vote_date, election_type_id]
      )
      console.log("insertElection result:", insertElection)
      usedElectionId = insertElection[0].election_id
    }

    const userId = 1

    const insertVote = await ds.query(
      `INSERT INTO VOTE_RECORD (user_id, election_id, candidate_name, vote_date, photo_url) VALUES ($1, $2, $3, $4, $5) RETURNING vote_id`,
      [userId, usedElectionId, candidate_name, vote_date, photo_url || null]
    )

    console.log("insertVote result:", insertVote)
  } catch (err) {
    console.error("Error running test_create_vote:", err)
    process.exit(1)
  } finally {
    // do not destroy AppDataSource to avoid interfering with running server
  }
}

main()
