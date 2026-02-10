import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontDisplay = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
});

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
      <body className={`${fontSans.variable} ${fontDisplay.variable} antialiased`}>
        <Navbar />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
