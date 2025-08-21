import { Router } from "express"
import { getDataSource } from "../data-source"
import { ElectionType } from "../models/ElectionType"

const router = Router()

// 選挙種類一覧取得 (DBから取得)
router.get("/", async (_req, res) => {
  try {
    const ds = await getDataSource()
    const repo = ds.getRepository(ElectionType)
    const items = await repo.find({ order: { election_type_id: "ASC" } })
    console.log("election types:", items)
    return res.json(items)
  } catch (e) {
    console.error("Failed to fetch election types:", e)
    return res.status(500).json({ message: "Internal server error" })
  }
})

// 選挙種類新規作成
router.post("/", async (req, res) => {
  try {
    const { name } = req.body as { name?: string }
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "name is required" })
    }
    const ds = await getDataSource()
    const repo = ds.getRepository(ElectionType)
    const exists = await repo.findOne({ where: { name } })
    if (exists) {
      return res.status(409).json({ message: "already exists", data: exists })
    }
    const created = repo.create({ name })
    await repo.save(created)
    return res.status(201).json(created)
  } catch (e) {
    console.error("Failed to create election type:", e)
    return res.status(500).json({ message: "Internal server error" })
  }
})

export default router
