import { CheckSquare, MessageSquare, HandHeart, BookOpen } from "lucide-react";

export function ParticipationMethods() {
  const methods = [
    {
      icon: CheckSquare,
      title: "投票する",
      description: "選挙は最も基本的な政治参加の形です。国政選挙、地方選挙、住民投票など、様々な機会があります。",
      image: "https://images.unsplash.com/photo-1597700331582-aab3614b3c0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b3RpbmclMjBiYWxsb3QlMjBkZW1vY3JhY3l8ZW58MXx8fHwxNzcxNjIxMTA1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      steps: [
        "選挙日程を確認する",
        "候補者や政策を調べる",
        "投票所に行く（期日前投票も可能）",
      ],
    },
    {
      icon: MessageSquare,
      title: "意見を表明する",
      description: "パブリックコメントや請願など、政策決定プロセスに直接意見を伝える方法があります。",
      image: "https://images.unsplash.com/photo-1762158008280-3dcb1d1cbd99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjBjb21tdW5pdHklMjBkaXNjdXNzaW9ufGVufDF8fHx8MTc3MTYyMTEwNXww&ixlib=rb-4.1.0&q=80&w=1080",
      steps: [
        "関心のある政策テーマを見つける",
        "パブリックコメント募集を確認",
        "自分の意見をまとめて提出する",
      ],
    },
    {
      icon: HandHeart,
      title: "地域活動に参加する",
      description: "町内会、NPO、ボランティア活動など、地域コミュニティでの活動も重要な政治参加です。",
      image: "https://images.unsplash.com/photo-1762158008280-3dcb1d1cbd99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjBjb21tdW5pdHklMjBkaXNjdXNzaW9ufGVufDF8fHx8MTc3MTYyMTEwNXww&ixlib=rb-4.1.0&q=80&w=1080",
      steps: [
        "地域の課題を知る",
        "興味のある活動を探す",
        "まずは参加してみる",
      ],
    },
    {
      icon: BookOpen,
      title: "情報を収集する",
      description: "政治や社会問題について学び、正確な情報に基づいて判断することが大切です。",
      image: "https://images.unsplash.com/photo-1662728132385-11fee9b3db9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3Zlcm5tZW50JTIwYnVpbGRpbmclMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzcxNjE0MDIyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      steps: [
        "複数の情報源を確認する",
        "ファクトチェックを活用する",
        "周囲の人と意見交換する",
      ],
    },
  ];

  return (
    <section id="how-to-use" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-slate-800">具体的な参加方法</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            政治への参加には様々な方法があります。
            自分に合った方法から始めてみましょう。
          </p>
        </div>

        <div className="space-y-12">
          {methods.map((method, index) => {
            const Icon = method.icon;
            const isEven = index % 2 === 0;
            
            return (
              <div
                key={index}
                className={`flex flex-col ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                } gap-8 items-center`}
              >
                <div className="flex-1">
                  <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={method.image}
                      alt={method.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="size-6 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">{method.title}</h3>
                  </div>

                  <p className="text-lg text-slate-600 leading-relaxed">
                    {method.description}
                  </p>

                  <div className="space-y-3">
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-bold">はじめ方</p>
                    <ul className="space-y-2">
                      {method.steps.map((step, stepIndex) => (
                        <li
                          key={stepIndex}
                          className="flex items-start gap-3 text-slate-700"
                        >
                          <span className="flex-shrink-0 w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-sm font-bold">
                            {stepIndex + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
