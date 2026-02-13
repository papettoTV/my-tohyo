import { NextResponse } from "next/server"
import { getDataSource } from "@/lib/db/data-source"

export async function GET() {
  try {
    const ds = await getDataSource()
    const items = await ds.query(
      `SELECT election_type_id, name FROM ELECTION_TYPE ORDER BY election_type_id ASC`
    )
    return NextResponse.json(items)
  } catch (error) {
    console.error("Failed to fetch election types:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json()
    if (!name || typeof name !== "string") {
      return NextResponse.json({ message: "name is required" }, { status: 400 })
    }
    const ds = await getDataSource()
    const exists = await ds.query(
      `SELECT election_type_id, name FROM ELECTION_TYPE WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [name]
    )
    if (exists?.length > 0) {
      return NextResponse.json({ message: "already exists", data: exists[0] }, { status: 409 })
    }
    const created = await ds.query(
      `INSERT INTO ELECTION_TYPE (name) VALUES ($1) RETURNING election_type_id, name`,
      [name]
    )
    return NextResponse.json(created[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create election type:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
