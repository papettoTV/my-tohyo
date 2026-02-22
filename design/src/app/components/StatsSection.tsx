export function StatsSection() {
  const stats = [
    {
      value: "70%",
      label: "近年の国政選挙投票率",
      description: "一人ひとりの投票が重要です",
    },
    {
      value: "1,700+",
      label: "全国の自治体数",
      description: "各地域で参加の機会があります",
    },
    {
      value: "18歳～",
      label: "選挙権年齢",
      description: "若い世代の声も大切です",
    },
    {
      value: "365日",
      label: "政治参加の機会",
      description: "選挙だけでなく日常的に参加できます",
    },
  ];

  return (
    <section className="py-20 px-6 bg-slate-800 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4">数字で見る政治参加</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            あなたの参加が社会を動かす力になります
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-slate-700/50 rounded-2xl backdrop-blur-sm border border-slate-600/50"
            >
              <div className="text-5xl mb-3 text-white">
                {stat.value}
              </div>
              <div className="text-lg mb-2 text-slate-200">
                {stat.label}
              </div>
              <div className="text-sm text-slate-400">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
