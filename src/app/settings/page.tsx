import { prisma } from '@/lib/prisma';
import { updateSettings } from '@/app/actions';
import { Save, Download, User, ShieldAlert } from 'lucide-react';
import ResetLessonsButton from '@/components/ResetLessonsButton';
import SecuritySettingsForm from '@/components/SecuritySettingsForm'; // [新增]

export default async function SettingsPage() {
    const tutorUser = await prisma.user.findFirst({
        where: { role: 'TUTOR' },
        include: { tutorProfile: true }
    });

    if (!tutorUser) return <div className="p-8">請先執行 Seed 建立資料</div>;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">系統設定</h1>
                <p className="text-gray-500 text-sm mt-1">
                    管理個人資料、系統偏好與資料備份
                </p>
            </div>

            <div className="space-y-8">

                {/* 1. 個人資料設定 */}
                <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <User size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">導師資料設定</h2>
                    </div>

                    <form action={updateSettings} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">顯示名稱</label>
                                <input type="text" name="name" defaultValue={tutorUser.name} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">聯絡電話</label>
                                <input type="text" name="phone" defaultValue={tutorUser.phone || ''} placeholder="09xx-xxx-xxx" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">教學理念 / 簡介</label>
                            <textarea name="bio" rows={3} defaultValue={tutorUser.tutorProfile?.bio || ''} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" />
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                                <Save size={18} /> 儲存變更
                            </button>
                        </div>
                    </form>
                </section>

                {/* 2. [新增] 帳號安全設定 */}
                <SecuritySettingsForm />

                {/* 3. 資料備份 */}
                <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <Download size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">資料備份</h2>
                    </div>

                    <div className="p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            系統資料皆儲存於本地端。建議您定期下載備份檔案 (JSON)，以防電腦故障導致資料遺失。
                        </p>
                        <a href="/api/backup" target="_blank">
                            <button type="button" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm">
                                <Download size={18} /> 下載完整備份 (.json)
                            </button>
                        </a>
                    </div>
                </section>

                {/* 4. 危險區域 */}
                <section className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-red-100 dark:border-red-900/30 flex items-center gap-3 bg-red-50 dark:bg-red-900/10">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                            <ShieldAlert size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-red-700 dark:text-red-400">危險區域</h2>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">重置所有課程紀錄</h3>
                                <p className="text-sm text-gray-500 mt-1 max-w-md">
                                    將刪除所有的歷史課程與未來排程。學生資料與考試成績將被保留。此動作<span className="font-bold text-red-600">無法復原</span>。
                                </p>
                            </div>
                            <ResetLessonsButton />
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
