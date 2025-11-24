import { prisma } from '@/lib/prisma';
import CalendarView from '@/components/CalendarView';

export default async function SchedulePage() {
    // 1. 取得導師資料
    const tutorUser = await prisma.user.findFirst({
        where: { role: 'TUTOR' },
        include: { tutorProfile: true }
    });

    if (!tutorUser?.tutorProfile) return <div className="p-8">請先執行 Seed 建立資料</div>;

    // 2. 抓取該導師的所有課程
    const rawLessons = await prisma.lesson.findMany({
        where: {
            tutorId: tutorUser.tutorProfile.id,
            status: {
                not: 'CANCELLED'
            }
        },
        select: {
            id: true,
            startTime: true,
            endTime: true,
            subject: true,
            isCompleted: true,
            student: {
                select: {
                    grade: true,
                    user: {
                        select: { name: true }
                    }
                }
            }
        }
    });

    // [關鍵修正] 過濾掉找不到學生資料的孤兒課程 (避免顯示已刪除學生的殘留課程)
    const allLessons = rawLessons.filter(lesson => lesson.student && lesson.student.user);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">行事曆</h1>
                <p className="text-gray-500 text-sm mt-1">
                    總覽您的教學行程安排
                </p>
            </div>

            {/* 載入互動式月曆元件 */}
            <CalendarView lessons={allLessons} />
        </div>
    );
}
