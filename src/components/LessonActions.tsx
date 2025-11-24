'use client';

import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { deleteLesson } from '@/app/actions';

export default function LessonActions({ id }: { id: string }) {
    const handleDelete = async () => {
        // 修改提示文字，讓您知道這只是清除內容
        const confirmed = window.confirm('確定要清除這堂課的紀錄內容嗎？\n\n課程將變回「未完成 (紅色)」狀態，保留排程。');
        if (confirmed) {
            await deleteLesson(id);
        }
    };

    return (
        <div className="flex gap-2">
            {/* 編輯按鈕 (連到編輯頁面) */}
            <Link
                href={`/lessons/${id}/edit`}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="編輯"
            >
                <Pencil size={18} />
            </Link>

            {/* 刪除按鈕 (直接執行) */}
            <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="刪除"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
}
