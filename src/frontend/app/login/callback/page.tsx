import { Suspense } from "react"
import LoginCallbackClient from "./LoginCallbackClient"

export default function LoginCallbackPage() {
  return (
    <Suspense fallback={<div>ログイン処理中...</div>}>
      <LoginCallbackClient />
    </Suspense>
  )
}
