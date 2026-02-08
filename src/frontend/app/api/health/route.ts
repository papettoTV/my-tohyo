import { NextResponse } from "next/server"
import { getDataSource } from "@/lib/db/data-source"

export async function GET() {
  try {
    const ds = await getDataSource()
    const result = await ds.query("SELECT 1 as connection_test")
    return NextResponse.json({
      status: "ok",
      database: result[0].connection_test === 1 ? "connected" : "error",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
      },
      { status: 500 }
    )
  }
}
