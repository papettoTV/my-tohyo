import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Vote, User, Building, FileText, ExternalLink, Camera, Share2 } from "lucide-react"
import Link from "next/link"

export default function HistoryDetailPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/history">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              履歴一覧に戻る
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">投票履歴詳細</h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">第50回衆議院議員総選挙</CardTitle>
                  <CardDescription className="flex items-center mt-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    2024年10月27日
                  </CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-800">当選</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Election Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Vote className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <div className="font-medium">選挙種類</div>
                      <div className="text-gray-600">衆議院議員総選挙</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium">候補者名</div>
                      <div className="text-gray-600">山田花子</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Building className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <div className="font-medium">所属政党</div>
                      <div className="text-gray-600">立憲民主党</div>
                    </div>
                  </div>
                </div>

                {/* Voting Photo */}
                <div className="space-y-2">
                  <div className="font-medium flex items-center">
                    <Camera className="w-4 h-4 mr-2" />
                    投票写真
                  </div>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <img
                      src="/placeholder.svg?height=200&width=300"
                      alt="投票写真"
                      className="w-full h-48 object-cover rounded"
                    />
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        シェア
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notes */}
              <div>
                <h3 className="font-medium mb-2">投票メモ</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    経済政策と環境政策のバランスが良く、特に再生可能エネルギーへの取り組みに共感したため投票しました。
                    地域の雇用創出についても具体的な提案があり、期待しています。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manifesto & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  マニフェスト
                </CardTitle>
                <CardDescription>候補者の選挙時の公約・政策</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-3">
                    <h4 className="font-medium">経済政策</h4>
                    <p className="text-sm text-gray-600">中小企業支援と雇用創出</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-3">
                    <h4 className="font-medium">環境政策</h4>
                    <p className="text-sm text-gray-600">再生可能エネルギー推進</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-3">
                    <h4 className="font-medium">社会保障</h4>
                    <p className="text-sm text-gray-600">子育て支援の充実</p>
                  </div>
                </div>
                <Link href="/manifesto/1">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    詳細を見る
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  実績・活動
                </CardTitle>
                <CardDescription>当選後の活動実績</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-3">
                    <h4 className="font-medium">法案提出</h4>
                    <p className="text-sm text-gray-600">中小企業支援法案を共同提出</p>
                    <p className="text-xs text-gray-500">2024年11月</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-3">
                    <h4 className="font-medium">委員会活動</h4>
                    <p className="text-sm text-gray-600">環境委員会で再エネ推進を議論</p>
                    <p className="text-xs text-gray-500">2024年12月</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-3">
                    <h4 className="font-medium">地域活動</h4>
                    <p className="text-sm text-gray-600">子育て支援センター視察</p>
                    <p className="text-xs text-gray-500">2024年12月</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  活動詳細を見る
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
