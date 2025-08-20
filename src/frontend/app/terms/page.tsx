import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
          </Link>
          <div className="flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">利用規約</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>MyTohyo 利用規約</CardTitle>
              <CardDescription>最終更新日: 2024年1月1日</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full rounded border p-4">
                <div className="space-y-6 text-sm">
                  <section>
                    <h3 className="text-lg font-semibold mb-3">第1条（適用）</h3>
                    <p className="text-gray-700 leading-relaxed">
                      本規約は、MyTohyo（以下「本サービス」）の利用に関して、本サービスを提供する運営者（以下「当社」）と本サービスを利用するユーザー（以下「ユーザー」）との間の権利義務関係を定めることを目的とし、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されます。
                    </p>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">第2条（利用登録）</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      本サービスにおいては、登録希望者が本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
                    </p>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">第3条（プライバシーの保護）</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      当社は、ユーザーの投票記録を含む個人情報の保護を最重要事項として取り扱います。
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>投票記録は本人のみが閲覧可能です</li>
                      <li>第三者への情報提供は行いません</li>
                      <li>適切なセキュリティ対策を実施します</li>
                      <li>法令に基づく場合を除き、情報の開示は行いません</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">第4条（禁止事項）</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>法令または公序良俗に違反する行為</li>
                      <li>犯罪行為に関連する行為</li>
                      <li>虚偽の投票記録を登録する行為</li>
                      <li>他のユーザーの情報を不正に取得する行為</li>
                      <li>本サービスの運営を妨害する行為</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">第5条（本サービスの提供の停止等）</h3>
                    <p className="text-gray-700 leading-relaxed">
                      当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
                    </p>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">第6条（著作権）</h3>
                    <p className="text-gray-700 leading-relaxed">
                      ユーザーは、自ら著作権等の必要な知的財産権を有するか、または必要な権利者の許諾を得た投票写真のみを、本サービスにアップロードするものとします。
                    </p>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">第7条（利用規約の変更）</h3>
                    <p className="text-gray-700 leading-relaxed">
                      当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。なお、本規約の変更後、本サービスの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなします。
                    </p>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">第8条（お問い合わせ窓口）</h3>
                    <p className="text-gray-700 leading-relaxed">
                      本サービスに関するお問い合わせは、本サービス内の適切なお問い合わせフォームまたは当社が別途指定する方法により行うものとします。
                    </p>
                  </section>
                </div>
              </ScrollArea>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link href="/login" className="flex-1">
                  <Button className="w-full">同意してログイン</Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    ホームに戻る
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
