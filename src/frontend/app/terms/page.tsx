import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="py-12 bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">利用規約</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="text-center border-b border-slate-100 bg-white rounded-t-2xl">
              <CardTitle className="text-2xl font-bold text-slate-800">MyTohyo 利用規約</CardTitle>
              <CardDescription className="text-slate-500">最終更新日: 2024年1月1日</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px] w-full p-8">
                <div className="space-y-10 text-slate-700">
                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">第1条（適用）</h2>
                    <p className="leading-relaxed">
                      本規約は、MyTohyo（以下「本サービス」）の利用に関して、本サービスを提供する運営者（以下「当社」）と本サービスを利用するユーザー（以下「ユーザー」）との間の権利義務関係を定めることを目的とし、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されます。
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">第2条（利用登録）</h2>
                    <p className="leading-relaxed mb-4">
                      本サービスにおいては、登録希望者が本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
                    </p>
                    <p className="leading-relaxed">
                      当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">第3条（プライバシーの保護）</h2>
                    <p className="leading-relaxed mb-4">
                      当社は、ユーザーの投票記録を含む個人情報の保護を最重要事項として取り扱います。
                    </p>
                    <ul className="space-y-3">
                      {[
                        "投票記録は本人のみが閲覧可能です",
                        "第三者への情報提供は行いません",
                        "適切なセキュリティ対策を実施します",
                        "法令に基づく場合を除き、情報の開示は行いません"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">第4条（禁止事項）</h2>
                    <p className="leading-relaxed mb-4">
                      ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
                    </p>
                    <ul className="space-y-3">
                      {[
                        "法令または公序良俗に違反する行為",
                        "犯罪行為に関連する行為",
                        "虚偽の投票記録を登録する行為",
                        "他のユーザーの情報を不正に取得する行為",
                        "本サービスの運営を妨害する行為"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">第5条（本サービスの提供の停止等）</h2>
                    <p className="leading-relaxed">
                      当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">第6条（著作権）</h2>
                    <p className="leading-relaxed">
                      ユーザーは、自ら著作権等の必要な知的財産権を有するか、または必要な権利者の許諾を得た投票写真のみを、本サービスにアップロードするものとします。
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">第7条（利用規約の変更）</h2>
                    <p className="leading-relaxed">
                      当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。なお、本規約の変更後、本サービスの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなします。
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">第8条（お問い合わせ窓口）</h2>
                    <p className="leading-relaxed">
                      本サービスに関するお問い合わせは、本サービス内の適切なお問い合わせフォームまたは当社が別途指定する方法により行うものとします。
                    </p>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
