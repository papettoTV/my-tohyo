"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const LoginCallback = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")
    const returnTo = searchParams.get("returnTo") || "/mypage"

    if (token) {
      // localStorage と cookie に保存（middleware 用）
      localStorage.setItem("token", token)
      document.cookie = `token=${token}; Path=/; Max-Age=604800; SameSite=Lax`
      router.replace(returnTo)
    } else {
      router.replace("/login")
    }
  }, [router, searchParams])

  return <div>ログイン処理中...</div>
}

export default LoginCallback
