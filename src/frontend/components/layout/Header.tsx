"use client";

import { Menu, X, LogOut, Info } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/users/me", { cache: "no-store" });
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      }
    }
    checkAuth();
  }, []);

  const navLinks = [
    { label: "MyTohyoとは", id: "about" },
    { label: "使い方", href: "/#how-to-use" },
    { label: "よくある質問", href: "/#faq" },
  ];

  const AboutModalContent = () => (
    <DialogContent className="sm:max-w-[500px] border-blue-100 bg-white p-0 overflow-hidden">
      <div className="bg-blue-50/50 p-6 border-b border-blue-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-extrabold text-blue-700">
            <Info className="w-6 h-6" />
            MyTohyoとは
          </DialogTitle>
        </DialogHeader>
      </div>
      <div className="p-6 space-y-6">
        <div className="text-slate-800 leading-relaxed space-y-4">
          <p className="font-bold text-lg text-blue-900 leading-tight">
            あなたの「一票」を、<br />もっと意味のあるものに。
          </p>
          <p className="text-sm sm:text-base">
            MyTohyoは、自分専用の投票記録・振り返りプラットフォームです。
          </p>
          <p className="text-sm sm:text-base">
            選挙のたびに「前回誰に投票したか」「どんな理由で選んだのか」を忘れてしまった経験はありませんか？
            MyTohyoを使えば、過去の投票行動を整理し、自分なりの「政治への関わり方」を確かな記録として残すことができます。
          </p>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            政治をもっと身近に、もっと主体的に。あなたの投票の歴史を、未来の選択に役立てましょう。
          </p>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-blue-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              MyTohyo
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.id === "about" ? (
                <Dialog key={link.label}>
                  <DialogTrigger asChild>
                    <button className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer">
                      {link.label}
                    </button>
                  </DialogTrigger>
                  <AboutModalContent />
                </Dialog>
              ) : (
                <Link
                  key={link.label}
                  href={link.href!}
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          {/* Desktop Auth Button */}
          <div className="hidden md:block">
            {isLoggedIn ? (
              <Link href="/logout">
                <Button variant="outline" className="border-blue-200 text-slate-600 hover:text-blue-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  ログアウト
                </Button>
              </Link>
            ) : (
              <Link href="/api/users/google?returnTo=/mypage">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  ログイン
                </Button>
              </Link>
            )}
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
              link.id === "about" ? (
                <Dialog key={link.label}>
                  <DialogTrigger asChild>
                    <button 
                      className="text-slate-600 hover:text-blue-600 transition-colors py-2 text-left"
                      onClick={(e) => {
                        // Keep menu open if needed, but Dialog usually handles its own overlay
                      }}
                    >
                      {link.label}
                    </button>
                  </DialogTrigger>
                  <AboutModalContent />
                </Dialog>
              ) : (
                <Link
                  key={link.label}
                  href={link.href!}
                  className="text-slate-600 hover:text-blue-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
            ))}
            {isLoggedIn ? (
              <Link href="/logout">
                <Button variant="outline" className="w-full border-blue-200 text-slate-600 hover:text-blue-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  ログアウト
                </Button>
              </Link>
            ) : (
              <Link href="/api/users/google?returnTo=/mypage">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  ログイン
                </Button>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
