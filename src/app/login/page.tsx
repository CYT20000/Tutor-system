'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // 防止表單預設刷新
        setIsLoading(true);
        setError('');

        // 執行登入驗證
        const result = await signIn('credentials', {
            redirect: false, // 我們手動處理跳轉
            email,
            password,
        });

        if (result?.error) {
            // --- 失敗流程 ---
            setError('帳號或密碼錯誤');
            alert('帳號或密碼錯誤！\n\n系統將於 5 秒後自動重新整理。');
            setTimeout(() => {
                window.location.reload();
            }, 5000);
            // 這裡保持 loading 狀態，避免使用者重複點擊
        } else {
            // --- 成功流程 ---
            // 1. 使用 replace 取代目前的歷史紀錄 (這樣按上一頁不會回到登入頁)
            router.replace('/');

            // 2. 重新整理路由快取，確保儀表板能抓到最新的登入狀態
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform rotate-3">
                        <Lock className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ryan 家教系統</h1>
                    <p className="text-gray-500 text-sm mt-2">請登入以管理課程與學生</p>
                </div>

                {/* 關鍵：使用 form 標籤並設定 onSubmit，這樣在密碼欄按 Enter 也能觸發登入 */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-200 animate-pulse">
                            {error} (即將重新整理...)
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tutor1@example.com"
                            className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">密碼</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="password123"
                            className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : '登入系統'}
                    </button>
                </form>
            </div>
        </div>
    );
}