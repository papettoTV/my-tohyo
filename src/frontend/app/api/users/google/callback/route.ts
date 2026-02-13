import { NextRequest, NextResponse } from "next/server"
import { OAuth2Client } from "google-auth-library"
import jwt from "jsonwebtoken"
import { getDataSource } from "@/lib/db/data-source"

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
)

const JWT_SECRET = process.env.JWT_SECRET || "default_secret"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state") || "/mypage"

    if (!code) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)

    // Fetch user info from Google
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const userInfo = await userInfoResponse.json()

    if (!userInfo.email) {
      return NextResponse.json({ message: "Email not found" }, { status: 400 })
    }

    const ds = await getDataSource()
    const userEmail = userInfo.email
    const userName = userInfo.name || userEmail.split("@")[0]

    let userRows = await ds.query(
      `SELECT user_id, name, email FROM "user" WHERE email = $1 LIMIT 1`,
      [userEmail]
    )
    if (!userRows || userRows.length === 0) {
      userRows = await ds.query(
        `INSERT INTO "user" (name, email, region) VALUES ($1, $2, $3)
         RETURNING user_id, name, email`,
        [userName, userEmail, "不明"]
      )
    }
    const user = userRows[0]

    const payload = {
      id: user.user_id,
      email: user.email,
      name: user.name,
      provider: "google",
    }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })

    // Set httpOnly cookie and redirect to target page
    const redirectUrl = new URL(state, req.url)
    const res = NextResponse.redirect(redirectUrl)
    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (error) {
    console.error("Google callback failed:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
