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
      console.error("JWT verification failed (Authorization Header):", err)
      return null
    }
  }

  // Try Cookies
  let cookieToken = req?.cookies.get("token")?.value
  if (!cookieToken) {
    try {
      cookieToken = (await cookies()).get("token")?.value
    } catch (e) {}
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
  if (req) {
    cookieNames = req.cookies.getAll().map(c => c.name)
  } else {
    try {
      cookieNames = (await cookies()).getAll().map(c => c.name)
    } catch (e) {}
  }
  console.warn("No auth token found. Cookies reaching server:", cookieNames)
  
  return null
}
