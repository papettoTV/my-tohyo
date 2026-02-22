"use client";

import { Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    { label: "MyTohyoとは", href: "/#about" },
    { label: "使い方", href: "/#how-to-use" },
    { label: "よくある質問", href: "/#faq" },
  ];

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
              <Link
                key={link.label}
                href={link.href}
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
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
              <Link
                key={link.label}
                href={link.href}
                className="text-slate-600 hover:text-blue-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
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
