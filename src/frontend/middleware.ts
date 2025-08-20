import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  // Check token cookie for protected paths
  const token = req.cookies.get("token")?.value
  if (!token) {
    const loginUrl = new URL("/login", req.url)
    const returnTo = req.nextUrl.pathname + (req.nextUrl.search || "")
    loginUrl.searchParams.set("returnTo", returnTo)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/mypage/:path*"],
}
