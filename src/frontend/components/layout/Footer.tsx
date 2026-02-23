import Link from "next/link";

export function Footer() {
  const footerLinks = [
    { label: "利用規約", href: "/terms" },
<<<<<<< HEAD
    { label: "お問い合わせ", href: "/#contact" },
=======
    { label: "お問い合わせ", href: "https://x.com/papettoTV" },
>>>>>>> feature/newdesign
  ];

  return (
    <footer className="bg-slate-50 text-slate-600 py-12 px-6 border-t border-slate-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo and Description */}
          <div className="text-center md:text-left">
            <div className="text-2xl font-bold text-blue-600 mb-2">MyTohyo</div>
            <p className="text-sm text-slate-500">
              投票先を記録して、振り返ろう
            </p>
          </div>

          {/* Footer Links */}
          <nav className="flex flex-wrap justify-center gap-6">
            {footerLinks.map((link) => (
              link.href.startsWith("http") ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-blue-600 transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm hover:text-blue-600 transition-colors"
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} MyTohyo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
