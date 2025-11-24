import { prisma } from '@/lib/prisma';
import { updateLessonStatus } from '@/app/actions';
import { Calendar, RefreshCw, XCircle } from 'lucide-react';

export default async function CourseChangesPage() {
    const tutorUser = await prisma.user.findFirst({
        where: { role: 'TUTOR' },
        include: { tutorProfile: true }
    });

    if (!tutorUser?.tutorProfile) return <div>請先執行 Seed</div>;

    // 抓取「未來」的課程
    const rawLessons = await prisma.lesson.findMany({
        where: {
            tutorId: tutorUser.tutorProfile.id,
            startTime: { gte: new Date() }, // 大於現在時間
        },
        include: { student: { include: { user: true } } },
        orderBy: { startTime: 'asc' }
    });

    // [關鍵修正] 過濾掉孤兒課程
    const upcomingLessons = rawLessons.filter(lesson => lesson.student && lesson.student.user);

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <RefreshCw className="text-blue-600" />
                    課程異動管理
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    處理臨時調課或取消課程 (同步更新至行事曆)
                </p>
            </div>

            <div className="space-y-4">
                {upcomingLessons.map(lesson => (
                    <div key={lesson.id} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${lesson.status === 'CANCELLED'
                        ? 'bg-gray-100 border-gray-200 opacity-75 dark:bg-gray-900 dark:border-gray-700'
                        : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                        }`}>

                        {/* 左側資訊 */}
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center font-bold ${lesson.status === 'CANCELLED'
                                ? 'bg-gray-200 text-gray-500 dark:bg-gray-800'
                                : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                                }`}>
                                <span className="text-xs">{lesson.startTime.getMonth() + 1}月</span>
                                <span className="text-lg">{lesson.startTime.getDate()}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900 dark:text-white">{lesson.student.user.name}</span>
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">{lesson.subject}</span>
                                    {lesson.status === 'CANCELLED' && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-bold">已取消</span>}
                                    {lesson.status === 'RESCHEDULED' && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full font-bold">已調課</span>}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Calendar size={14} />
                                    {lesson.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {lesson.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>

                        {/* 右側操作區 */}
                        {lesson.status !== 'CANCELLED' && (
                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">

                                {/* 取消按鈕 */}
                                <form action={updateLessonStatus}>
                                    <input type="hidden" name="lessonId" value={lesson.id} />
                                    <input type="hidden" name="actionType" value="CANCEL" />
                                    <button type="submit" className="w-full flex items-center justify-center gap-1 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg text-sm font-medium transition-colors">
                                        <XCircle size={16} /> 取消課程
                                    </button>
                                </form>

                                {/* 調課表單 */}
                                <form action={updateLessonStatus} className="flex flex-col md:flex-row items-stretch md:items-center gap-2 bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
                                    <input type="hidden" name="lessonId" value={lesson.id} />
                                    <input type="hidden" name="actionType" value="RESCHEDULE" />
                                    <span className="text-xs text-gray-500">改至:</span>
                                    <input type="date" name="newDate" required className="text-sm p-1 border rounded dark:bg-gray-800 dark:border-gray-600" />
                                    <input type="time" name="newTime" required defaultValue="19:00" className="text-sm p-1 border rounded dark:bg-gray-800 dark:border-gray-600" />
                                    <button type="submit" className="px-3 py-1 bg-amber-500 text-white rounded text-sm hover:bg-amber-600 whitespace-nowrap">
                                        確認調課
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                ))}

                {upcomingLessons.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <p>目前沒有未來的課程安排</p>
                    </div>
                )}
            </div>
        </div>
    );
}
