'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Calendar,
    RefreshCw,
    LogOut,
    Bot
} from 'lucide-react';

const menuItems = [
    { name: '儀表板', href: '/', icon: LayoutDashboard },
    { name: '學生', href: '/students', icon: Users },
    { name: '課程', href: '/lessons', icon: BookOpen },
    { name: '行事曆', href: '/schedule', icon: Calendar },
    { name: '異動', href: '/course-changes', icon: RefreshCw },
    { name: 'AI', href: '/ai-agent', icon: Bot },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <>
            {/* 1. 手機版頂部 Header (顯示 Logo 與登出) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-40 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xs">
                        R
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">Ryan Tutor</span>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                >
                    <LogOut size={18} />
                </button>
            </div>

            {/* 2. 手機版底部導航 Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 pb-safe">
                <div className="flex justify-around items-center h-16">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        );
                    })}

                    {/* 系統設定 (放不下,改成連結) */}
                    <Link
                        href="/settings"
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/settings'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        {/* 這裡用一個齒輪圖示 */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={pathname === '/settings' ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                        <span className="text-[10px] font-medium">設定</span>
                    </Link>
                </div>
            </div>

            {/* 內容墊高 (防止內容被 Header 擋住) */}
            <div className="h-14 md:hidden" />
        </>
    );
}
