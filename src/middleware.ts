export { default } from "next-auth/middleware";

// 設定哪些路徑「必須」登入才能看
export const config = {
    matcher: [
        // 保護所有路徑，除了靜態檔案、圖片、登入頁
        "/((?!login|api|_next/static|_next/image|favicon.ico).*)",
    ],
};
