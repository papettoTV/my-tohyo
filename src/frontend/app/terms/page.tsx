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
              <CardDescription className="text-slate-500">最終更新日: 2026年2月23日</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px] w-full p-8">
                <div className="space-y-10 text-slate-700 text-sm sm:text-base">
                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">第1条（適用）</h2>
                    <p className="leading-relaxed">
                      本規約は、MyTohyo（以下「本サービス」）の利用に関して、本サービスを提供する運営者（papettoTV、以下「運営者」）と、本サービスを利用するユーザー（以下「ユーザー」）との間の権利義務関係を定めることを目的とし、本サービスの利用に関わる一切の関係に適用されます。
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">第2条（本サービスの内容とAIの利用）</h2>
                    <p className="leading-relaxed mb-4">
                      本サービスは、ユーザーの投票記録の管理および、政治関連情報の提供を目的としています。
                    </p>
                    <p className="leading-relaxed">
                      本サービス内で提供される政党の情報やマニフェスト等の要約は、AI（人工知能）を利用して自動的に収集・生成されている場合があります。情報の正確性、最新性、完全性については最大限配慮しておりますが、常に正確であることを保証するものではありません。ユーザーは、重要な決定（実際の投票行動等）を行う際には、必ず公的な情報源を確認するものとします。
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">第3条（利用登録）</h2>
                    <p className="leading-relaxed mb-4">
                      本サービスにおいては、登録希望者が本規約に同意の上、運営者の定める方法によって利用登録を申請し、運営者がこれを承認することによって、利用登録が完了するものとします。
                    </p>
                    <p className="leading-relaxed">
                      運営者は、利用登録の申請者に法令違反や過去の規約違反、その他運営者が不適切と判断する事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">第4条（プライバシーの保護）</h2>
                    <p className="leading-relaxed mb-4">
                      運営者は、ユーザーの投票記録を含む個人情報の保護を最重要事項として取り扱います。
                    </p>
                    <ul className="space-y-3">
                      {[
                        "投票記録は原則として本人のみが閲覧可能です（システム管理上の必要最小限のアクセスを除く）",
                        "ユーザーの同意なく第三者へ個人情報を提供することはありません",
                        "適切なセキュリティ対策を実施し、情報の漏洩防止に努めます",
                        "法令に基づく正式な照会がある場合を除き、情報の開示は行いません"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0 mt-2" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">第5条（禁止事項）</h2>
                    <p className="leading-relaxed mb-4">
                      ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
                    </p>
                    <ul className="space-y-3">
                      {[
                        "法令または公序良俗に違反する行為",
                        "本サービスの脆弱性を突く行為、またはサーバー・ネットワークに過度の負担をかける行為",
                        "本サービスの情報を不正にスクレイピングする行為",
                        "他のユーザーのなりすまし、または情報の窃取",
                        "本サービスの運営を妨害するおそれのある全ての行為"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 mt-2" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">第6条（免責事項）</h2>
                    <p className="leading-relaxed mb-4">
                      運営者は、本サービスに関して、ユーザーに生じたあらゆる損害について、運営者に故意または重大な過失がある場合を除き、一切の責任を負いません。
                    </p>
                    <p className="leading-relaxed mb-4">
                      本サービスは個人によって運営されており、予期せぬ不具合、サーバーの停止、データの消失等が発生する可能性があります。重要な記録については、ユーザー自身の責任においてバックアップ等の措置を講じるものとし、運営者はデータ消失等による損害について補償いたしません。
                    </p>
                    <p className="leading-relaxed">
                      本サービスに関連して、ユーザーと他のユーザーまたは第三者との間において生じた紛争等については、ユーザーが自己の責任において解決するものとし、運営者は一切関与いたしません。
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">第7条（著作権）</h2>
                    <p className="leading-relaxed">
                      本サービス内でユーザーが作成したメモ等の著作権はユーザーに帰属します。ただし、運営者は本サービスの円滑な運営、保守、改善に必要な範囲で、当該内容を無償で利用（バックアップの作成、表示の最適化等）できるものとします。
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">第8条（利用規約の変更）</h2>
                    <p className="leading-relaxed">
                      運営者は、必要と判断した場合には、本サービス上での告知をもって本規約を変更することができるものとします。変更後も引き続き本サービスを利用した場合、ユーザーは変更後の規約に同意したものとみなされます。
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">第9条（準拠法・裁判管轄）</h2>
                    <p className="leading-relaxed">
                      本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、運営者の所在地を管轄する裁判所を専属的合意管轄とします。
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">第10条（お問い合わせ）</h2>
                    <p className="leading-relaxed">
                      本サービスに関するお問い合わせは、運営者の指定する連絡先（Xアカウント: @papettoTV ）へのダイレクトメッセージ、または運営者が別途指定する方法により行うものとします。
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
