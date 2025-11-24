'use client';

import { resetAllLessons } from '@/app/actions';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function ResetLessonsButton() {
    const [isPending, setIsPending] = useState(false);

    const handleReset = async () => {
        // 第一次確認
        const confirmed = window.confirm('⚠️ 嚴重警告 ⚠️\n\n您確定要刪除「所有」的課程紀錄與排程嗎？\n\n此動作將清空所有歷史上課內容與未來排程。\n(您的學生資料與考試成績會被保留)');

        if (confirmed) {
            // 第二次確認 (防止手滑)
            const doubleConfirmed = window.confirm('請再次確認：這項操作「無法復原」。\n\n您真的要執行重置嗎？');

            if (doubleConfirmed) {
                setIsPending(true);
                await resetAllLessons();
                setIsPending(false);
                alert('所有課程已重置完成。');
            }
        }
    };

    return (
        <button
            onClick={handleReset}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors font-medium whitespace-nowrap text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Trash2 size={18} />
            {isPending ? '重置中...' : '確認重置'}
        </button>
    );
}
