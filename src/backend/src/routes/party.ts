import { Router } from "express"
import { getDataSource } from "../data-source"
import { Party } from "../models/Party"

const router = Router()

// 政党一覧取得 (DBから取得)
router.get("/", async (_req, res) => {
  try {
    const ds = await getDataSource()
    const partyRepo = ds.getRepository(Party)
    const parties = await partyRepo.find({ order: { party_id: "ASC" } })
    return res.json(parties)
  } catch (e) {
    console.error("Failed to fetch parties:", e)
    return res.status(500).json({ message: "Internal server error" })
  }
})

// 政党新規作成（未実装）
router.post("/", (_req, res) => {
  res.status(501).json({ message: "Not implemented" })
})

export default router
