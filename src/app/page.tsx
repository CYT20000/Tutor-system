import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Greeting from '@/components/Greeting';

// 這是一個 Server Component (直接在伺服器端抓資料)
export default async function Home() {
  // 1. 模擬我們是第一位導師
  const tutorUser = await prisma.user.findFirst({
    where: { role: 'TUTOR' },
    include: { tutorProfile: true }
  });

  if (!tutorUser || !tutorUser.tutorProfile) {
    return <div>找不到導師資料，請確認是否已執行 Seed。</div>;
  }

  const tutorId = tutorUser.tutorProfile.id;

  // [新增] 定義時間範圍：現在 ~ 7天後
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  // 2. 抓取數據
  const [studentCount, weeklyLessonCount, upcomingLessons] = await Promise.all([
    // 統計學生總數
    prisma.studentProfile.count({
      where: { tutorId: tutorId }
    }),
    // [修改] 統計「未來一週內」且「未取消」的課程數
    prisma.lesson.count({
      where: {
        tutorId: tutorId,
        status: { not: 'CANCELLED' },
        startTime: {
          gte: now,      // 大於現在
          lte: nextWeek  // 小於 7 天後
        }
      }
    }),
    // 抓取未來 7 天的課程列表 (邏輯保持不變，剛好也是顯示這些)
    // 抓取未來 7 天的課程列表 (邏輯保持不變，剛好也是顯示這些)
    prisma.lesson.findMany({
      where: {
        tutorId: tutorId,
        startTime: {
          gte: now,
        },
        status: {
          not: 'CANCELLED'
        }
      },
      orderBy: { startTime: 'asc' },
      take: 20, // [修改] 多抓一點，以便過濾後還有剩
      include: { student: { include: { user: true } } }
    })
  ]);

  // [關鍵修正] 過濾掉孤兒課程，並只取前 5 筆
  const validUpcomingLessons = upcomingLessons
    .filter(lesson => lesson.student && lesson.student.user)
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* 頂部歡迎區 */}
      <div className="mb-8">
        <Greeting name={tutorUser.name || '老師'} />
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          這是您今天的教學概況。
        </p>
      </div>

      {/* 數據卡片區 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 卡片 1: 學生數 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">負責學生</div>
          <div className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
            {studentCount} <span className="text-base text-gray-400 font-normal">位</span>
          </div>
        </div>

        {/* 卡片 2: 未來一週課程數 (已更新) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">未來一週課程</div>
          <div className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {weeklyLessonCount} <span className="text-base text-gray-400 font-normal">堂</span>
          </div>
        </div>

        {/* 卡片 3: 待辦事項 (保留) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">待批改作業</div>
          <div className="mt-2 text-3xl font-bold text-amber-500">
            0 <span className="text-base text-gray-400 font-normal">份</span>
          </div>
        </div>
      </div>

      {/* 即將到來的課程清單 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">即將到來的課程</h2>
          <Link href="/schedule" className="text-sm text-blue-600 hover:text-blue-500">查看行事曆</Link>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {upcomingLessons.length > 0 ? (
            upcomingLessons.map((lesson) => (
              <div key={lesson.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-4">
                  {/* 日期時間顯示 */}
                  <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <span className="text-xs font-bold uppercase">
                      {lesson.startTime.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold">
                      {lesson.startTime.getDate()}
                    </span>
                  </div>

                  {/* 課程資訊 */}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {lesson.content || "固定排程課程"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      學生：{lesson.student.user.name} ({lesson.student.grade})
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <span>🕒 {lesson.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {lesson.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {lesson.status === 'RESCHEDULED' && <span className="text-amber-500 font-bold">(已調課)</span>}
                    </div>
                  </div>
                </div>

                {/* 連結到課程紀錄列表 */}
                <Link href={`/lessons`} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                  查看
                </Link>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              未來 7 天內沒有排定課程
            </div>
          )}
        </div>
      </div>
    </main>
  );
}