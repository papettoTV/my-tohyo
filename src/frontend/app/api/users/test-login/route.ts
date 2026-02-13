import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getDataSource } from "@/lib/db/data-source"
import { User } from "@/lib/db/entities"

const JWT_SECRET = process.env.JWT_SECRET || "default_secret"

export async function GET(req: NextRequest) {
  if (process.env.ALLOW_TEST_AUTH !== "true") {
    return NextResponse.json({ message: "Test auth is not allowed" }, { status: 403 })
  }

  try {
    const ds = await getDataSource()
    const userRepo = ds.getRepository(User)
    const testEmail = "test-user@example.com"
    const testName = "Test User"

    let user = await userRepo.findOne({ where: { email: testEmail } })
    if (!user) {
      user = new User()
      user.name = testName
      user.email = testEmail
      user.region = "test-region"
      await userRepo.save(user)
    }

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
    console.error("Test login failed:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
