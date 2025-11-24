'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react'; // [新增] 引入登出功能
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Calendar,
    RefreshCw,
    Settings,
    LogOut
} from 'lucide-react';

const menuItems = [
    { name: '儀表板', href: '/', icon: LayoutDashboard },
    { name: '學生管理', href: '/students', icon: Users },
    { name: '課程紀錄', href: '/lessons', icon: BookOpen },
    { name: '行事曆', href: '/schedule', icon: Calendar },
    { name: '課程異動', href: '/course-changes', icon: RefreshCw },
    { name: '系統設定', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
            {/* Logo 區域 */}
            <div className="p-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    R
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                    Ryan Tutor
                </span>
            </div>

            {/* 選單區域 */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                                }`}
                        >
                            <Icon size={20} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* 底部登出區 */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <button
                    // [新增] 綁定登出事件，登出後自動跳轉回 /login 頁面
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                >
                    <LogOut size={20} />
                    登出系統
                </button>
            </div>
        </div>
    );
}