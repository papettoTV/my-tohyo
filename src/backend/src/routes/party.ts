import { Router } from "express"

const router = Router()

// NOTE: 簡易実装として静的データを返します（後でDB連携に置換可能）
type Party = {
  party_id: number
  name: string
}

const seedParties: Party[] = [
  { party_id: 1, name: "自由民主党" },
  { party_id: 2, name: "立憲民主党" },
  { party_id: 3, name: "日本維新の会" },
  { party_id: 4, name: "公明党" },
  { party_id: 5, name: "国民民主党" },
  { party_id: 6, name: "日本共産党" },
  { party_id: 7, name: "れいわ新選組" },
  { party_id: 8, name: "社会民主党" },
  { party_id: 9, name: "参政党" },
  { party_id: 10, name: "NHK党" },
]

// 政党一覧取得
router.get("/", (_req, res) => {
  res.json(seedParties)
})

// 政党新規作成（未実装）
router.post("/", (_req, res) => {
  res.status(501).json({ message: "Not implemented" })
})

export default router
