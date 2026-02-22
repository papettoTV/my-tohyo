import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section id="faq" className="py-24 px-6 bg-gradient-to-br from-slate-700 to-slate-800">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl mb-6 text-white">
          今日から始める政治参加
        </h2>
        <p className="text-xl text-slate-200 mb-10 leading-relaxed">
          一人ひとりの小さな行動が、大きな変化を生み出します。
          <br />
          あなたも今日から、より良い社会づくりに参加しませんか？
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a href="#how-to-use" className="px-8 py-4 bg-white text-slate-800 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-lg">
            参加方法をもっと詳しく
            <ArrowRight className="size-5" />
          </a>
          <a href="#faq" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors text-lg inline-block">
            よくある質問
          </a>
        </div>

        <div className="pt-12 border-t border-slate-600">
          <p className="text-slate-300 text-sm">
            このサイトは政治への参加を促進するための情報提供を目的としています。
            <br />
            特定の政党や候補者を支援するものではありません。
          </p>
        </div>
      </div>
    </section>
  );
}