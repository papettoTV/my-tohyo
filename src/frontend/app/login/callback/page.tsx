"use client"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

const LoginCallback = () => {
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")
    const returnTo = searchParams.get("returnTo") || "/mypage"

    if (token) {
      // localStorage と cookie に保存（middleware 用）
      localStorage.setItem("token", token)
      document.cookie = `token=${token}; Path=/; Max-Age=604800; SameSite=Lax`
      // サーバー側で cookie を確実に認識させるため、フルリロードで遷移
      window.location.href = returnTo
    } else {
      window.location.href = "/login"
    }
  }, [searchParams])

  return <div>ログイン処理中...</div>
}

export default LoginCallback
