import { Router } from "express"

const router = Router()

// 候補者一覧取得
router.get("/", (_req, res) => {
  // TODO: 実装
  res.json([])
})

// 候補者新規作成
router.post("/", (_req, res) => {
  // TODO: 実装
  res.status(201).json({})
})

export default router
