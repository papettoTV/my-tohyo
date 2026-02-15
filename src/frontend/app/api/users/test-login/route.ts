import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getDataSource } from "@/lib/db/data-source"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "default_secret"

export async function GET(req: NextRequest) {
  console.log("ALLOW_TEST_AUTH env:", process.env.ALLOW_TEST_AUTH)
  if (process.env.ALLOW_TEST_AUTH !== "true") {
    return NextResponse.json({ message: "Test auth is not allowed" }, { status: 403 })
  }

  try {
    const ds = await getDataSource()
    const testEmail = "test-user@example.com"
    const testName = "Test User"

    let userRows = await ds.query(
      `SELECT user_id, name, email FROM "user" WHERE email = $1 LIMIT 1`,
      [testEmail]
    )
    if (!userRows || userRows.length === 0) {
      userRows = await ds.query(
        `INSERT INTO "user" (name, email, region) VALUES ($1, $2, $3)
         RETURNING user_id, name, email`,
        [testName, testEmail, "test-region"]
      )
    }
    const user = userRows[0]

    const payload = {
      id: user.user_id,
      email: user.email,
      name: user.name,
      provider: "test",
    }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
    
    // In many sites, returnTo might be passed as a query param
    const { searchParams } = new URL(req.url)
    const returnTo = searchParams.get("returnTo") || "/mypage"

    const redirectUrl = new URL(returnTo, req.url)
    const cookieStore = await cookies()
    console.log("Setting token cookie in test-login via cookies() API. Token length:", token.length)
    
    // Main auth cookie
    cookieStore.set("my_tohyo_auth", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    // Non-httpOnly debug cookie (visible in document.cookie)
    cookieStore.set("my_tohyo_debug", "active", {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("Test login failed:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
