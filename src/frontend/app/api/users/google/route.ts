import { NextRequest, NextResponse } from "next/server"
import { OAuth2Client } from "google-auth-library"

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const returnTo = searchParams.get("returnTo") || "/mypage"

    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
      state: returnTo,
    })

    return NextResponse.redirect(url)
  } catch (error) {
    console.error("Google auth initiate failed:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
