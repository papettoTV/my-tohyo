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
    const userRepo = ds.getRepository("User")
    
    let user = await userRepo.findOne({ where: { email: userInfo.email } })
    if (!user) {
      // Create new user if not exists
      user = userRepo.create({
        name: userInfo.name || userInfo.email.split("@")[0],
        email: userInfo.email,
        region: "不明", // Default
      })
      await userRepo.save(user)
    }

    const payload = {
      id: user.user_id,
      email: user.email,
      name: user.name,
      provider: "google",
    }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })

    // Redirect to the frontend callback
    return NextResponse.redirect(new URL(`/login/callback?token=${token}&returnTo=${encodeURIComponent(state)}`, req.url))
  } catch (error) {
    console.error("Google callback failed:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
