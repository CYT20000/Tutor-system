'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

// 定義一下我們需要的資料格式
type Student = {
    id: string;
    user: { name: string };
    grade: string | null;
    subjects: string | null; // 例如 "數學, 英文"
};

type LessonFormProps = {
    students: Student[];
    action: (formData: FormData) => Promise<void>; // Server Action
    initialData?: any; // 編輯模式時會傳入舊資料
};

export default function LessonForm({ students, action, initialData }: LessonFormProps) {
    // 記錄目前選到的學生 ID
    const [selectedStudentId, setSelectedStudentId] = useState<string>(initialData?.studentId || '');

    // 根據選到的學生，計算出可選的科目清單
    const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

    useEffect(() => {
        if (selectedStudentId) {
            const student = students.find(s => s.id === selectedStudentId);
            if (student && student.subjects) {
                // 把 "數學, 英文" 切割成 ["數學", "英文"]
                setAvailableSubjects(student.subjects.split(',').map(s => s.trim()));
            } else {
                setAvailableSubjects(['一般']);
            }
        } else {
            setAvailableSubjects([]);
        }
    }, [selectedStudentId, students]);

    return (
        <form action={action} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">

            {/* 隱藏 ID (編輯用) */}
            {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. 學生選擇 */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">上課學生</label>
                    <select
                        name="studentId"
                        required
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                        <option value="">請選擇學生...</option>
                        {students.map(s => (
                            <option key={s.id} value={s.id}>{s.user.name} ({s.grade})</option>
                        ))}
                    </select>
                </div>

                {/* 2. 科目選擇 (動態出現) */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">本次上課科目</label>
                    <select
                        name="subject"
                        required
                        defaultValue={initialData?.subject || ''}
                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                        {availableSubjects.length > 0 ? (
                            availableSubjects.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))
                        ) : (
                            <option value="一般">一般 (該學生未設定科目)</option>
                        )}
                    </select>
                </div>

                {/* 3. 日期與時間 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">日期</label>
                    <input
                        type="date"
                        name="date"
                        required
                        defaultValue={initialData?.startTime ? new Date(initialData.startTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">開始時間</label>
                    <input
                        type="time"
                        name="time"
                        required
                        defaultValue={initialData?.startTime ? new Date(initialData.startTime).toTimeString().slice(0, 5) : "19:00"}
                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 my-4"></div>

            {/* 4. 內容區塊 */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">本次上課內容</label>
                <textarea name="content" defaultValue={initialData?.content || ''} rows={3} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">指派作業內容</label>
                <textarea name="homework" defaultValue={initialData?.homework || ''} rows={2} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">下次考試範圍</label>
                <input type="text" name="nextExamScope" defaultValue={initialData?.nextExamScope || ''} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">備註</label>
                <textarea name="note" defaultValue={initialData?.note || ''} rows={2} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors">
                <Save size={20} />
                {initialData ? '更新紀錄' : '儲存紀錄'}
            </button>
        </form>
    );
}
