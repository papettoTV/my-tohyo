import { Router } from "express"

const router = Router()

// ユーザー一覧取得
router.get("/", (_req, res) => {
  // TODO: 実装
  res.json([])
})

// ユーザー一覧取得
router.get("/hoge", (_req, res) => {
  // TODO: 実装
  res.json([])
})

// ユーザー新規作成
router.post("/", (_req, res) => {
  // TODO: 実装
  res.status(201).json({})
})

import passport from "../middleware/passport"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "default_secret"

// Google認証開始
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
)

// Google認証コールバック
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    // JWT発行
    const user = req.user as any
    if (!user) {
      return res.status(401).json({ message: "No user info" })
    }
    // profile情報からpayloadを作成（必要に応じて調整）
    const payload = {
      id:
        user.id ||
        user.sub ||
        user.profileId ||
        user._json?.sub ||
        user._json?.id,
      email: user.emails?.[0]?.value || user.email,
      name: user.displayName || user.name,
      provider: user.provider || "google",
    }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
    // 認証後、フロントエンドのコールバックページにリダイレクトし、トークンをクエリで渡す
    res.redirect(`http://localhost:3000/login/callback?token=${token}`)
  }
)

export default router
