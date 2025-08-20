import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Vote, Shield, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
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
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl">今すぐ始めましょう</CardTitle>
              <CardDescription>Googleアカウントでログインして、投票記録の管理を開始できます</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Googleでログイン
                </Button>
              </Link>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/terms">
                  <Button variant="outline" size="sm">
                    利用規約
                  </Button>
                </Link>
                <Link href="/mypage">
                  <Button variant="outline" size="sm">
                    マイページ
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
