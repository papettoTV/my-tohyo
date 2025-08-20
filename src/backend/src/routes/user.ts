import { Router } from "express"
import { authenticateJWT } from "../middleware/auth"
import { getDataSource } from "../data-source"
import { User } from "../models/User"

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

/**
 * ユーザー新規作成
 */
router.post("/", (_req, res) => {
  // TODO: 実装
  res.status(201).json({})
})

/**
 * 認証済みユーザー情報取得
 * JWT の email からDBのUserを取得して返す
 */
router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const ds = await getDataSource()
    // @ts-ignore
    const tokenUser = req.user as any
    const email = tokenUser?.email
    if (!email) {
      return res.status(400).json({ message: "Email not found in token" })
    }

    const userRepo = ds.getRepository(User)
    const user = await userRepo.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.json(user)
  } catch (e) {
    return res.status(500).json({ message: "Internal server error" })
  }
})

import passport from "../middleware/passport"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "default_secret"

// Google認証開始
router.get("/google", (req, res, next) => {
  const returnTo = (req.query.returnTo as string) || "/mypage"
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: returnTo,
    session: false,
  })(req, res, next)
})

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
        user.user_id ||
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
    const returnTo = (req.query.state as string) || "/mypage"
    res.redirect(
      `http://localhost:3000/login/callback?token=${token}&returnTo=${encodeURIComponent(
        returnTo
      )}`
    )
  }
)

export default router
