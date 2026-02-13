import { NextRequest, NextResponse } from "next/server"
import { getDataSource } from "@/lib/db/data-source"
import { verifyAuth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const tokenUser = verifyAuth(req) as any
    const email = tokenUser?.email
    if (!email) {
      return NextResponse.json({ message: "Email not found in token" }, { status: 400 })
    }

    const ds = await getDataSource()
    const rows = await ds.query(
      `SELECT user_id, name, email, region FROM "user" WHERE email = $1 LIMIT 1`,
      [email]
    )
    const user = rows?.[0]
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("GET /api/users/me failed:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
