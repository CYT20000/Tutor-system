import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // 1. 去資料庫找這個人
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                // 2. 檢查密碼 (這裡暫時用明文比對，因為 Seed 資料是明文)
                // 在正式產品中,我們會用 bcrypt.compare 來比對加密密碼
                if (user && user.password === credentials.password) {
                    // 驗證成功，回傳使用者資料
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role, // 把角色也帶進去
                    };
                }

                // 驗證失敗
                return null;
            }
        })
    ],
    pages: {
        signIn: '/login', // 指定我們的登入頁面路徑
    },
    callbacks: {
        // 讓 Session 也能讀到 User ID 和 Role
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.sub;
                // (session.user as any).role = token.role; // 若需要角色判斷可加這行
            }
            return session;
        }
    }
});

export { handler as GET, handler as POST };
