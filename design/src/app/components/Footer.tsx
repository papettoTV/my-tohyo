export function Footer() {
  const footerLinks = [
    { label: "利用規約", href: "#terms" },
    { label: "プライバシーポリシー", href: "#privacy" },
    { label: "お問い合わせ", href: "#contact" },
  ];

  return (
    <footer className="bg-slate-50 text-slate-600 py-12 px-6 border-t border-slate-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo and Description */}
          <div className="text-center md:text-left">
            <div className="text-2xl text-blue-600 mb-2">MyTohyo</div>
            <p className="text-sm text-slate-500">
              投票の記録を、かんたんに
            </p>
          </div>

          {/* Footer Links */}
          <nav className="flex flex-wrap justify-center gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm hover:text-blue-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 text-center text-sm text-slate-400">
          <p>© 2026 MyTohyo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}