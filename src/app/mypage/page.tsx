import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { History, LogOut, Plus, Calendar, Vote } from "lucide-react"
import Link from "next/link"

export default function MyPage() {
  const recentVotes = [
    {
      id: 1,
      date: "2024年10月27日",
      electionName: "第50回衆議院議員総選挙",
      candidate: "山田花子",
      party: "立憲民主党",
    },
    {
      id: 2,
      date: "2024年7月7日",
      electionName: "東京都知事選挙",
      candidate: "小池百合子",
      party: "無所属",
    },
    {
      id: 3,
      date: "2023年4月23日",
      electionName: "東京都議会議員選挙",
      candidate: "佐藤次郎",
      party: "自由民主党",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" />
              <AvatarFallback>田中</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">田中太郎さん</h1>
              <p className="text-gray-600">東京都在住</p>
              <Badge variant="secondary" className="mt-1">
                投票記録: 5件
              </Badge>
            </div>
          </div>
          <Link href="/logout">
            <Button variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </Button>
          </Link>
        </div>

        {/* Main Action - 投票記録登録 */}
        <div className="mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-blue-500 text-white">
            <Link href="/register">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Plus className="h-8 w-8 text-white" />
                  <div>
                    <CardTitle className="text-white text-xl">
                      投票記録登録
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      新しい投票記録を登録します
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* 過去の投票履歴 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="h-5 w-5 text-purple-600" />
                <CardTitle>過去の投票履歴</CardTitle>
              </div>
              <Link href="/history">
                <Button variant="ghost" size="sm">
                  すべて見る
                </Button>
              </Link>
            </div>
            <CardDescription>最新の投票記録</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-4">
              {recentVotes.map((vote) => (
                <div
                  key={vote.id}
                  className="border-l-4 border-blue-500 pl-4 py-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">
                        {vote.electionName}
                      </h4>
                      <div className="flex items-center text-xs text-gray-600 mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {vote.date}
                      </div>
                      <div className="flex items-center text-xs text-gray-600 mt-1">
                        <Vote className="w-3 h-3 mr-1" />
                        {vote.candidate}（{vote.party}）
                      </div>
                    </div>
                    <Link href={`/history/${vote.id}`}>
                      <Button variant="outline" size="sm">
                        詳細
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/history">
              <Button className="w-full bg-transparent" variant="outline">
                履歴一覧を見る
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
