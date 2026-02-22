export function HeroSection({ className }: { className?: string }) {
  const allowTestAuth = process.env.NEXT_PUBLIC_ALLOW_TEST_AUTH === "true";

  return (
    <section className={`relative min-h-[600px] flex-grow flex items-center justify-center overflow-hidden ${className || ""}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 opacity-95" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1662728132385-11fee9b3db9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3Zlcm5tZW50JTIwYnVpbGRpbmclMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzcxNjE0MDIyfDA&ixlib=rb-4.1.0&q=80&w=1080')] bg-cover bg-center mix-blend-overlay opacity-20" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
          投票先を記録して
          <br />
          振り返ろう
        </h1>
        <p className="text-xl md:text-2xl text-white/95 mb-10 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] max-w-2xl mx-auto">
          あなたが投票した政党や候補者を記録しておくと、
          <br />
          後でその人たちがどんな活動をしていたか分かります。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/api/users/google?returnTo=/mypage"
            className="px-10 py-4 bg-white text-blue-600 rounded-full hover:bg-white/90 hover:scale-105 transition-all inline-block shadow-2xl font-bold text-lg"
          >
            Googleではじめる
          </a>
          {allowTestAuth && (
            <a
              href="/api/users/test-login?returnTo=/mypage"
              className="px-10 py-4 bg-blue-500/20 backdrop-blur-md border border-white/30 text-white rounded-full hover:bg-white/10 hover:scale-105 transition-all inline-block shadow-2xl font-bold text-lg"
            >
              テストログイン
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
