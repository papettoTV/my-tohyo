import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Calendar, Vote, Eye, Filter } from "lucide-react"
import Link from "next/link"

const votingHistory = [
  {
    id: 1,
    date: "2024年10月27日",
    electionType: "衆議院議員総選挙",
    electionName: "第50回衆議院議員総選挙",
    candidate: "山田花子",
    party: "立憲民主党",
    hasPhoto: true,
    status: "当選",
  },
  {
    id: 2,
    date: "2024年7月7日",
    electionType: "都知事選挙",
    electionName: "東京都知事選挙",
    candidate: "小池百合子",
    party: "無所属",
    hasPhoto: true,
    status: "当選",
  },
  {
    id: 3,
    date: "2023年4月23日",
    electionType: "統一地方選挙",
    electionName: "東京都議会議員選挙",
    candidate: "佐藤次郎",
    party: "自由民主党",
    hasPhoto: false,
    status: "落選",
  },
  {
    id: 4,
    date: "2022年7月10日",
    electionType: "参議院議員通常選挙",
    electionName: "第26回参議院議員通常選挙",
    candidate: "田中三郎",
    party: "日本維新の会",
    hasPhoto: true,
    status: "当選",
  },
  {
    id: 5,
    date: "2021年10月31日",
    electionType: "衆議院議員総選挙",
    electionName: "第49回衆議院議員総選挙",
    candidate: "鈴木四郎",
    party: "公明党",
    hasPhoto: false,
    status: "当選",
  },
]

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/mypage">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              マイページに戻る
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">過去の投票履歴</h1>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="候補者名、政党名で検索..." className="pl-10" />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                フィルター
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* History List */}
        <div className="space-y-4">
          {votingHistory.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{record.date}</span>
                      <Badge variant="outline">{record.electionType}</Badge>
                      {record.hasPhoto && <Badge variant="secondary">写真あり</Badge>}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{record.electionName}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Vote className="w-4 h-4 mr-1" />
                        {record.candidate}
                      </div>
                      <span>({record.party})</span>
                      <Badge
                        variant={record.status === "当選" ? "default" : "secondary"}
                        className={record.status === "当選" ? "bg-green-100 text-green-800" : ""}
                      >
                        {record.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/history/${record.id}`}>
                      <Button size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        詳細
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination or Load More */}
        <div className="text-center mt-8">
          <Button variant="outline">さらに読み込む</Button>
        </div>
      </div>
    </div>
  )
}
