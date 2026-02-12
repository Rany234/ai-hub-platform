import type { Metadata } from "next";

import Link from "next/link";

import "./globals.css";

import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "智汇 AI-Hub - 专业的 AI 服务与技能交易平台",
  description:
    "汇聚全球 AI 智慧与服务的交易平台。在这里，您可以买卖 Prompt、模型部署服务，或发布定制化 AI 开发需求。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased font-sans flex flex-col min-h-screen">
        <div className="bg-amber-950/30 border-b border-amber-500/20 text-amber-400 text-xs font-medium py-2 text-center sticky top-0 z-[100] backdrop-blur-md">
          🚀 技术预览版 (Technical Preview)：为验证《共生纪元》价值分配逻辑，当前交易处于沙盒模拟模式。不涉及真实资金流转。
        </div>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-white/5 bg-[#0B1121] py-8">
          <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
            <div className="font-medium text-slate-400">
              © 2026 智汇 AI-Hub · Symbiosis Era
            </div>
            <div className="flex items-center gap-6">
              <Link href="/manifesto" className="hover:text-amber-500 transition-colors">
                Manifesto (共生宣言)
              </Link>
              <Link href="/listings" className="hover:text-white transition-colors">
                服务市场
              </Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                控制台
              </Link>
            </div>
          </div>
        </footer>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
