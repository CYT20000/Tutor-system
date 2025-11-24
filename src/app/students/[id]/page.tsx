import { prisma } from '@/lib/prisma';
import { generateRecurringLessons } from '@/app/actions';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, School, Book, Calendar, Target, Pencil } from 'lucide-react';

export default async function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // 1. 抓取學生詳細資料 (包含課程與考試)
    const student = await prisma.studentProfile.findUnique({
        where: { id },
        include: {
            user: true,
            lessons: {
                orderBy: { startTime: 'desc' },
                take: 5 // 只顯示最近 5 堂課
            },
            exams: {
                orderBy: { date: 'desc' },
                take: 5 // 只顯示最近 5 次考試
            }
        }
    });

    if (!student) return <div>找不到學生資料</div>;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            {/* 頂部導航 */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/students" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">學生詳細資料</h1>
                </div>

                {/* 新增：編輯按鈕 */}
                <Link href={`/students/${id}/edit`}>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium shadow-sm">
                        <Pencil size={18} />
                        <span className="hidden md:inline">編輯資料</span>
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 左側：個人檔案卡片 */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                        <div className="w-24 h-24 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl font-bold mb-4">
                            {student.user.name[0]}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{student.user.name}</h2>
                        <div className="flex items-center justify-center gap-2 mt-2 text-gray-500 text-sm">
                            <School size={16} />
                            <span>{student.school} {student.grade}</span>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-left space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold">補習科目</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {student.subjects?.split(',').map(sub => (
                                        <span key={sub} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium">
                                            {sub.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1">
                                    <Phone size={12} /> 家長聯絡
                                </label>
                                <div className="mt-1 text-gray-900 dark:text-white font-medium">
                                    {student.parentPhone || "未設定"}
                                </div>
                            </div>

                            {student.locationUrl && (
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1">
                                        <MapPin size={12} /> 家教地點
                                    </label>
                                    <a
                                        href={student.locationUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-1 block px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm text-center hover:bg-blue-100 transition-colors"
                                    >
                                        開啟 Google Maps 導航
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 右側：紀錄總覽 */}
                <div className="md:col-span-2 space-y-6">

                    {/* 新增：固定課表設定區 */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Calendar size={20} className="text-blue-500" />
                            設定固定課表 (自動生成未來 3 個月)
                        </h3>
                        <form action={generateRecurringLessons} className="flex flex-col md:flex-row gap-4 items-end">
                            <input type="hidden" name="studentId" value={student.id} />

                            <div className="flex-1 w-full">
                                <label className="block text-xs font-medium text-gray-500 mb-1">星期幾</label>
                                <select name="dayOfWeek" className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
                                    <option value="1">每週一</option>
                                    <option value="2">每週二</option>
                                    <option value="3">每週三</option>
                                    <option value="4">每週四</option>
                                    <option value="5">每週五</option>
                                    <option value="6">每週六</option>
                                    <option value="0">每週日</option>
                                </select>
                            </div>

                            <div className="flex-1 w-full">
                                <label className="block text-xs font-medium text-gray-500 mb-1">開始時間</label>
                                <input type="time" name="time" defaultValue="19:00" className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900" />
                            </div>

                            {/* [新增] 上課時長選擇 */}
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-medium text-gray-500 mb-1">時長</label>
                                <select name="duration" className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
                                    <option value="60">1 小時</option>
                                    <option value="90">1.5 小時</option>
                                    <option value="120">2 小時</option>
                                    <option value="150">2.5 小時</option>
                                    <option value="180">3 小時</option>
                                </select>
                            </div>

                            <div className="flex-1 w-full">
                                <label className="block text-xs font-medium text-gray-500 mb-1">科目</label>
                                <select name="subject" className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
                                    {student.subjects?.split(',').map(s => <option key={s} value={s.trim()}>{s.trim()}</option>)}
                                    <option value="一般">一般</option>
                                </select>
                            </div>

                            <button type="submit" className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap">
                                生成課表
                            </button>
                        </form>
                        <p className="text-xs text-gray-400 mt-2">
                            * 按下後將自動建立未來 12 週的課程紀錄，這些紀錄會同步顯示在行事曆與課程異動列表中。
                        </p>
                    </div>


                    {/* 最近課程 */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Book size={20} className="text-blue-500" />
                            最近上課紀錄
                        </h3>
                        <div className="space-y-4">
                            {student.lessons.length > 0 ? (
                                student.lessons.map(lesson => (
                                    <div key={lesson.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center flex-shrink-0 text-gray-600 dark:text-gray-300">
                                            <span className="text-xs font-bold">{lesson.startTime.getMonth() + 1}月</span>
                                            <span className="text-lg font-bold">{lesson.startTime.getDate()}</span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {lesson.subject}
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-1">
                                                {lesson.content || "無內容紀錄"}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">尚無上課紀錄</p>
                            )}
                        </div>
                        <div className="mt-4 text-center">
                            <Link href="/lessons" className="text-sm text-blue-600 hover:underline">查看全部課程 &rarr;</Link>
                        </div>
                    </div>

                    {/* 最近考試 */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Target size={20} className="text-amber-500" />
                            最近考試成績
                        </h3>
                        <div className="space-y-3">
                            {student.exams.length > 0 ? (
                                student.exams.map(exam => (
                                    <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Calendar size={16} className="text-gray-400" />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white text-sm">{exam.title}</div>
                                                <div className="text-xs text-gray-500">{exam.date.toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${(exam.score || 0) >= 60
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {exam.score ?? '-'}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">尚無考試紀錄</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
