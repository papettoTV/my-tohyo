import { NextRequest, NextResponse } from "next/server"
import { getDataSource } from "@/lib/db/data-source"
import { verifyAuth } from "@/lib/auth"
import { User } from "@/lib/db/models/User"

export async function GET(req: NextRequest) {
  try {
    const tokenUser = verifyAuth(req) as any
    const email = tokenUser?.email
    if (!email) {
      return NextResponse.json({ message: "Email not found in token" }, { status: 400 })
    }

    const ds = await getDataSource()
    const userRepo = ds.getRepository(User)
    const user = await userRepo.findOne({ where: { email } })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("GET /api/users/me failed:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
