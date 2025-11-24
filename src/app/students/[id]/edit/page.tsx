import { prisma } from '@/lib/prisma';
import { updateStudent } from '@/app/actions';
import Link from 'next/link';
import { ArrowLeft, Save, MapPin } from 'lucide-react';

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // 1. 抓取舊資料
    const student = await prisma.studentProfile.findUnique({
        where: { id },
        include: { user: true }
    });

    if (!student) return <div>找不到學生資料</div>;

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href={`/students/${id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">編輯學生資料</h1>
            </div>

            <form action={updateStudent} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
                {/* 隱藏的 ID 欄位 */}
                <input type="hidden" name="id" value={student.id} />

                {/* 基本資料 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">學生姓名</label>
                    <input type="text" name="name" defaultValue={student.user.name} required className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">學校</label>
                        <input type="text" name="school" defaultValue={student.school || ''} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">年級</label>
                        <select name="grade" defaultValue={student.grade || ''} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                            <option value="">請選擇...</option>
                            {['國一', '國二', '國三', '高一', '高二', '高三'].map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">補習科目</label>
                    <input type="text" name="subjects" defaultValue={student.subjects || ''} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 my-4"></div>

                {/* 聯絡資訊 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">家長聯絡方式</label>
                    <input type="text" name="parentContact" defaultValue={student.parentPhone || ''} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <MapPin size={16} />
                        家教地點連結
                    </label>
                    <input type="url" name="locationUrl" defaultValue={student.locationUrl || ''} placeholder="https://..." className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                </div>

                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors">
                    <Save size={20} />
                    儲存變更
                </button>
            </form>
        </div>
    );
}
