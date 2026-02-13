import { NextResponse } from "next/server"
import { getDataSource } from "@/lib/db/data-source"
import { ElectionType } from "@/lib/db/entities"

export async function GET() {
  try {
    const ds = await getDataSource()
    const repo = ds.getRepository(ElectionType)
    const items = await repo.find({ order: { election_type_id: "ASC" } })
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
    const repo = ds.getRepository(ElectionType)
    const exists = await repo.findOne({ where: { name } })
    if (exists) {
      return NextResponse.json({ message: "already exists", data: exists }, { status: 409 })
    }
    const created = repo.create({ name })
    await repo.save(created)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Failed to create election type:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
