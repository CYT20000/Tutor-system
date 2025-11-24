import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
    Plus,
    BookOpen,
    Target,
    FileText,
    StickyNote
} from 'lucide-react';
import LessonActions from '@/components/LessonActions';

export default async function LessonsPage() {
    const tutorUser = await prisma.user.findFirst({
        where: { role: 'TUTOR' },
        include: { tutorProfile: true }
    });

    if (!tutorUser?.tutorProfile) return <div>請先執行 Seed</div>;

    const rawLessons = await prisma.lesson.findMany({
        where: {
            tutorId: tutorUser.tutorProfile.id,
            status: { not: 'CANCELLED' },
            isCompleted: true // [新增] 只顯示已填寫紀錄的課程
        },
        include: {
            student: {
                include: { user: true }
            }
        },
        orderBy: {
            startTime: 'desc'
        }
    });

    // [關鍵修正] 過濾掉找不到學生資料的孤兒課程
    const allLessons = rawLessons.filter(lesson => lesson.student && lesson.student.user);

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">課程紀錄</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        查看教學進度、作業指派與考試規劃
                    </p>
                </div>
                <Link href="/lessons/new">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">
                        <Plus size={18} />
                        <span className="hidden md:inline">新增紀錄</span>
                        <span className="md:hidden">新增</span>
                    </button>
                </Link>
            </div>

            <div className="space-y-4">
                {allLessons.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500">目前沒有任何課程紀錄</p>
                    </div>
                ) : (
                    allLessons.map((lesson) => (
                        <div key={lesson.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">

                            <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm">
                                        {lesson.student.user.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">
                                            {lesson.student.user.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {lesson.student.grade} • <span className="text-blue-600 dark:text-blue-400 font-medium">{lesson.subject}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="text-right text-sm">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {lesson.startTime.getFullYear()}/{lesson.startTime.getMonth() + 1}/{lesson.startTime.getDate()}
                                        </div>
                                        <div className="text-gray-500 text-xs">
                                            {lesson.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <LessonActions id={lesson.id} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div className="col-span-1 md:col-span-2">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1 flex items-center gap-1">
                                        <FileText size={12} /> 上課內容
                                    </h4>
                                    <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap">
                                        {lesson.content || "未填寫內容"}
                                    </p>
                                </div>

                                {lesson.homework && (
                                    <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-100 dark:border-purple-900/20">
                                        <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1">
                                            <BookOpen size={12} /> 指派作業
                                        </h4>
                                        <p className="text-purple-900 dark:text-purple-100 text-sm">
                                            {lesson.homework}
                                        </p>
                                    </div>
                                )}

                                {lesson.nextExamScope && (
                                    <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                        <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
                                            <Target size={12} /> 下次考試範圍
                                        </h4>
                                        <p className="text-amber-900 dark:text-amber-100 text-sm">
                                            {lesson.nextExamScope}
                                        </p>
                                    </div>
                                )}

                                {lesson.note && (
                                    <div className="col-span-1 md:col-span-2 mt-1 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                                        <div className="flex items-start gap-2 text-sm text-gray-500 italic">
                                            <StickyNote size={14} className="mt-0.5 flex-shrink-0" />
                                            <span>{lesson.note}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}