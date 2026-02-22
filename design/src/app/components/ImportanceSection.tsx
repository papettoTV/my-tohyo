import { Vote, Users, Lightbulb, TrendingUp } from "lucide-react";

export function ImportanceSection() {
  const reasons = [
    {
      icon: Vote,
      title: "民主主義の基盤",
      description: "投票や意見表明は、民主主義社会における最も基本的な権利であり、社会の方向性を決める重要な手段です。",
    },
    {
      icon: Users,
      title: "多様な声の反映",
      description: "様々な立場や価値観を持つ人々が参加することで、より公平で包括的な社会が実現します。",
    },
    {
      icon: Lightbulb,
      title: "社会課題の解決",
      description: "教育、医療、環境など、私たちの生活に直結する課題は、市民の積極的な参加によって解決に向かいます。",
    },
    {
      icon: TrendingUp,
      title: "未来への投資",
      description: "今日の政治参加は、次世代により良い社会を引き継ぐための重要な投資です。",
    },
  ];

  return (
    <section id="about" className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 text-slate-800">なぜ政治への参加が大切なのか</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            政治は私たちの日常生活と深く結びついています。
            参加することで、より良い社会をつくることができます。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200"
              >
                <div className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center mb-6">
                  <Icon className="size-7 text-white" />
                </div>
                <h3 className="text-2xl mb-3 text-slate-800">{reason.title}</h3>
                <p className="text-slate-600 leading-relaxed">{reason.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}