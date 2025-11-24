import Link from 'next/link';
import { createStudent } from '@/app/actions';
import { ArrowLeft, Save, MapPin } from 'lucide-react';

export default function NewStudentPage() {
    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/students" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">新增學生</h1>
            </div>

            <form action={createStudent} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">

                {/* 基本資料 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">學生姓名</label>
                    <input type="text" name="name" required placeholder="例：張小明" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">學校</label>
                        <input type="text" name="school" placeholder="例：建國中學" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">年級</label>
                        <select name="grade" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                            <option value="">請選擇...</option>
                            <option value="國一">國一</option>
                            <option value="國二">國二</option>
                            <option value="國三">國三</option>
                            <option value="高一">高一</option>
                            <option value="高二">高二</option>
                            <option value="高三">高三</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">補習科目</label>
                    <input type="text" name="subjects" placeholder="例：數學, 英文 (請用逗號分隔)" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 my-4"></div>

                {/* 簡化後的家長聯絡資訊 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">家長聯絡方式</label>
                    <input type="text" name="parentContact" placeholder="例：0912-345-678 或 LINE ID" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                </div>

                {/* 新增：家教地點連結 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <MapPin size={16} />
                        家教地點連結
                    </label>
                    <input type="url" name="locationUrl" placeholder="例：https://maps.app.goo.gl/..." className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                    <p className="text-xs text-gray-500 mt-1">請貼上 Google Maps 分享連結，方便之後直接導航。</p>
                </div>

                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors">
                    <Save size={20} />
                    儲存學生資料
                </button>
            </form>
        </div>
    );
}
