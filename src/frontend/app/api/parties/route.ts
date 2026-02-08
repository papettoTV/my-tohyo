import { NextResponse } from "next/server"
import { getDataSource } from "@/lib/db/data-source"

export async function GET() {
  try {
    const ds = await getDataSource()
    const partyRepo = ds.getRepository("Party")
    const parties = await partyRepo.find({ order: { party_id: "ASC" } })
    return NextResponse.json(parties)
  } catch (error) {
    console.error("Failed to fetch parties:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 })
}
