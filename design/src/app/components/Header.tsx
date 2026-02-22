import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: "MyTohyoとは", href: "#about" },
    { label: "使い方", href: "#how-to-use" },
    { label: "よくある質問", href: "#faq" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-blue-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-2xl text-blue-600">
              MyTohyo
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Login Button */}
          <div className="hidden md:block">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              ログイン
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="メニュー"
          >
            {isMenuOpen ? (
              <X className="size-6 text-blue-600" />
            ) : (
              <Menu className="size-6 text-blue-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-slate-600 hover:text-blue-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              ログイン
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}