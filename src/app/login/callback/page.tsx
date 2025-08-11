"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

const LoginCallback = () => {
  const router = useRouter()

  useEffect(() => {
    // クエリからトークンを取得
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")

    if (token) {
      // トークンをlocalStorageに保存（必要に応じてcookie等でもOK）
      localStorage.setItem("token", token)
      // 任意のログイン後ページへ遷移
      router.replace("/mypage")
    } else {
      // トークンがない場合はログインページへ
      router.replace("/login")
    }
  }, [router])

  return <div>ログイン処理中...</div>
}

export default LoginCallback
