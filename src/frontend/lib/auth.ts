import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"
import { cookies, headers } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "default_secret"

export async function verifyAuth(req?: NextRequest) {
  // Try Headers
  let authHeader = req?.headers.get("authorization")
  if (!authHeader) {
    try {
      authHeader = (await headers()).get("authorization")
    } catch (e) {}
  }

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1]
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      return decoded
    } catch (err) {
      console.warn("JWT verification failed (Authorization Header), falling back to cookies:", err.message)
    }
  }

  // Try Cookies
  let cookieToken = req?.cookies.get("my_tohyo_auth")?.value
  if (!cookieToken) {
    try {
      cookieToken = (await cookies()).get("my_tohyo_auth")?.value
    } catch (e) {}
  }

  // Backup: Check old 'token' name just in case transition is slow
  if (!cookieToken) {
    cookieToken = req?.cookies.get("token")?.value
    if (!cookieToken) {
      try {
        cookieToken = (await cookies()).get("token")?.value
      } catch (e) {}
    }
  }

  if (cookieToken) {
    try {
      const decoded = jwt.verify(cookieToken, JWT_SECRET)
      return decoded
    } catch (err) {
      console.error("JWT verification failed (Cookie):", err)
      return null
    }
  }

  // Debugging: What cookies ARE present?
  let cookieNames: string[] = []
  let allHeaders: Record<string, string> = {}
  
  if (req) {
    allHeaders = Object.fromEntries(req.headers.entries())
    cookieNames = req.cookies.getAll().map(c => c.name)
  } else {
    try {
      const h = await headers()
      allHeaders = Object.fromEntries(h.entries())
      cookieNames = (await cookies()).getAll().map(c => c.name)
    } catch (e) {}
  }
  
  console.warn("No auth token found.")
  console.warn("Cookies reaching server:", cookieNames)
  console.warn("All Headers:", JSON.stringify(allHeaders))
  
  return null
}
