import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar"; // 引入導航欄

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
    /* ⚠️ 注意：一定要有這個 html 標籤 */
    <html lang="zh-TW" suppressHydrationWarning={true}>

      {/* ⚠️ 注意：一定要有這個 body 標籤 */}
      <body
        className={`${inter.className} antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}
        suppressHydrationWarning={true}
      >
        <div className="flex min-h-screen">
          {/* 左側導航 */}
          <aside className="hidden md:block fixed inset-y-0 z-50">
            <Sidebar />
          </aside>

          {/* 右側內容 */}
          <main className="flex-1 md:pl-64 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}