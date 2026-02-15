import { NextRequest, NextResponse } from "next/server"
import { cookies, headers } from "next/headers"

export async function GET(req: NextRequest) {
  const h = await headers()
  const c = await cookies()
  
  const debugInfo = {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(h.entries()),
    cookies: c.getAll().map(cookie => ({
      name: cookie.name,
      value: cookie.name === "token" ? "[REDACTED]" : cookie.value
    })),
    env_node_env: process.env.NODE_ENV,
    env_vercel: process.env.VERCEL || "false",
  }
  
  return NextResponse.json(debugInfo)
}
