import { withAuth } from "next-auth/middleware";

// 明確匯出 default function，讓 Next.js 看得懂
export default withAuth({
    pages: {
        signIn: '/login', // 明確指定登入頁面在哪裡
    },
});

// 設定保護範圍
export const config = {
    matcher: [
        // 保護所有路徑，除了登入頁、API 和靜態資源
        "/((?!login|api|_next/static|_next/image|favicon.ico).*)",
    ],
};