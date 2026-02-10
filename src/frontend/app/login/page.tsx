import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Vote, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import LoginClient from "./LoginClient"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Vote className="h-10 w-10 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">MyTohyo</h1>
          </div>
          <p className="text-gray-600">アカウントでログイン</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>ログイン</CardTitle>
            <CardDescription>
              ソーシャルアカウントでログインしてください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Suspense fallback={<div>読み込み中...</div>}>
              <LoginClient />
            </Suspense>
          </CardContent>
        </Card>

        {/* Terms */}
        <div className="text-center mt-6 text-sm text-gray-600">
          ログインすることで、
          <Link href="/terms" className="text-blue-600 hover:underline">
            利用規約
          </Link>
          に同意したものとみなされます
        </div>
      </div>
    </div>
  )
}
