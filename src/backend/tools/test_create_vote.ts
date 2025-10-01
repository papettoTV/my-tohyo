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
      party_id: 1,
      party_name: "テスト政党",
    }

    const {
      vote_date,
      election_type_id,
      election_name,
      candidate_name,
      photo_url,
      notes,
      party_id,
      party_name,
    } = payload as any

    if (!vote_date) {
      console.error("Missing required vote_date")
      return
    }

    if (!election_type_id || !election_name) {
      console.error("Missing election info")
      return
    }

    const etRows = await ds.query(
      `SELECT election_type_id FROM ELECTION_TYPE WHERE election_type_id = $1`,
      [election_type_id]
    )
    console.log("election_type rows:", etRows)
    if (!etRows || etRows.length === 0) {
      console.error("Invalid election_type_id")
      return
    }

    if (party_id) {
      const partyRows = await ds.query(
        `SELECT party_id FROM PARTY WHERE party_id = $1`,
        [party_id]
      )
      if (!partyRows || partyRows.length === 0) {
        console.error("Invalid party_id")
        return
      }
    }

    const userId = 1

    const insertVote = await ds.query(
      `INSERT INTO VOTE_RECORD (
         user_id,
         candidate_name,
         election_name,
         election_type_id,
         vote_date,
         party_name,
         photo_url,
         notes
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING vote_id`,
      [
        userId,
        candidate_name,
        election_name,
        election_type_id,
        vote_date,
        party_name,
        photo_url || null,
        notes || null,
      ]
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
