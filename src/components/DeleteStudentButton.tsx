'use client';

import { Trash2 } from 'lucide-react';
import { deleteStudent } from '@/app/actions';

export default function DeleteStudentButton({ id, name }: { id: string, name: string }) {
    // 接收 event 物件 (e)
    const handleDelete = async (e: React.MouseEvent) => {
        // 關鍵修正：
        e.preventDefault();  // 1. 阻止預設行為 (例如連結跳轉)
        e.stopPropagation(); // 2. 阻止事件冒泡 (不要讓外層的 Link 知道我被點了)

        const confirmed = window.confirm(`確定要刪除學生「${name}」嗎？\n此動作無法復原，相關的成績和課程紀錄都會被刪除。`);

        if (confirmed) {
            await deleteStudent(id);
        }
    };

    return (
        <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="刪除學生"
        >
            <Trash2 size={20} />
        </button>
    );
}
