import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Vote, Shield, Users, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const allowTestAuth = process.env.NEXT_PUBLIC_ALLOW_TEST_AUTH === "true"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Vote className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">MyTohyo</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            あなたの投票記録を安全に保存し、政治参加の履歴を管理できるプラットフォーム
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader className="text-center">
                <Vote className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle>投票記録管理</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>選挙での投票記録を詳細に保存し、いつでも振り返ることができます</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <CardTitle>プライバシー保護</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>あなたの投票記録は完全にプライベートで、他の人には見えません</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <CardTitle>政治参加促進</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>マニフェストや実績を確認し、より良い政治参加をサポートします</CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="text-center text-lg lg:text-xl">
            <CardHeader>
              <CardTitle className="text-2xl">今すぐ始めましょう</CardTitle>
              <CardDescription>Googleアカウントでログインして、投票記録の管理を開始できます</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Link href="/api/users/google?returnTo=/mypage" className="w-full sm:w-auto">
                <Button size="lg" className="w-full px-8">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Googleでログイン
                </Button>
              </Link>
              {allowTestAuth && (
                <Link href="/api/users/test-login?returnTo=/mypage" className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full border-dashed border-2 px-8" size="lg">
                    <Sparkles className="w-5 h-5 mr-2 text-amber-500" />
                    テストログイン (認証バイパス)
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 pb-8">
          <Link href="/terms" className="hover:text-blue-600 transition-colors underline-offset-4 hover:underline">
            利用規約
          </Link>
          <p className="mt-2 text-xs">© {new Date().getFullYear()} MyTohyo</p>
        </footer>
      </div>
    </div>
  )
}
