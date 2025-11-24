'use client';

import { hardDeleteLesson } from '@/app/actions';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HardDeleteButton({ id }: { id: string }) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false); // 新增：處理中狀態

    const handleDelete = async () => {
        // 第一次確認
        const confirmed = window.confirm('⚠️ 確定要「徹底刪除」這堂課嗎？\n\n這將會移除行事曆上的標籤，且無法復原。\n(如果您只是想重寫內容，請直接修改並儲存即可)');

        if (confirmed) {
            // 第二次確認 (雙重保險)
            const doubleConfirmed = window.confirm('請再次確認：\n\n這筆排程將會「永久消失」。\n您確定要執行刪除嗎？');

            if (doubleConfirmed) {
                setIsPending(true); // 鎖定按鈕
                await hardDeleteLesson(id);
                router.push('/schedule');
                router.refresh();
            }
        }
    };

    return (
        <button
            type="button"
            onClick={handleDelete}
            disabled={isPending} // 防止重複點擊
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl transition-colors font-medium w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Trash2 size={20} />
            {isPending ? '刪除中...' : '徹底刪除排程'}
        </button>
    );
}
