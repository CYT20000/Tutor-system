import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav"; // [新增]

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ryan Tutor System",
  description: "Professional Tutor Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning={true}>
      <body
        className={`${inter.className} antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}
        suppressHydrationWarning={true}
      >
        <div className="flex min-h-screen">
          {/* 電腦版左側導航 (手機隱藏) */}
          <aside className="hidden md:block fixed inset-y-0 z-50">
            <Sidebar />
          </aside>

          {/* 主要內容區 */}
          {/* md:pl-64 是給電腦版留左邊空位 */}
          {/* pb-20 是給手機版留底部空位 (避免被導航擋住) */}
          <main className="flex-1 md:pl-64 min-h-screen pb-20 md:pb-0">
            {children}
          </main>

          {/* 手機版底部導航 (電腦隱藏) */}
          <MobileNav />
        </div>
      </body>
    </html>
  );
}