import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Phone, MapPin } from 'lucide-react';
import DeleteStudentButton from '@/components/DeleteStudentButton';

export default async function StudentsPage() {
    const tutorUser = await prisma.user.findFirst({
        where: { role: 'TUTOR' },
        include: { tutorProfile: true }
    });

    if (!tutorUser?.tutorProfile) return <div>請先執行 Seed 建立導師資料</div>;

    const rawStudents = await prisma.studentProfile.findMany({
        where: {
            tutorId: tutorUser.tutorProfile.id
        },
        include: {
            user: true,
            _count: {
                select: { lessons: true }
            }
        },
        orderBy: {
            grade: 'desc'
        }
    });

    // [關鍵修正] 過濾掉找不到 User 帳號的孤兒學生資料
    const students = rawStudents.filter(student => student.user);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* 頁面標題與操作區 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">學生管理</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        共 {students.length} 位學生
                    </p>
                </div>

                {/* 右側只保留新增按鈕 (已移除搜尋框) */}
                <div>
                    <Link href="/students/new">
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">
                            <Plus size={18} />
                            <span className="hidden md:inline">新增學生</span>
                            <span className="md:hidden">新增</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* 學生列表 - Mobile View (卡片式) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {students.map((student) => (
                    <Link key={student.id} href={`/students/${student.id}`} className="block">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm active:scale-[0.98] transition-transform">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                                        {student.user.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{student.user.name}</h3>
                                        <p className="text-sm text-gray-500">{student.school} • {student.grade}</p>
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <DeleteStudentButton id={student.id} name={student.user.name} />
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-xs text-gray-500">累計課程</div>
                                    <div className="font-semibold text-gray-900 dark:text-white">{student._count.lessons} 堂</div>
                                </div>
                                <div className="text-center border-l border-gray-100 dark:border-gray-700">
                                    <div className="text-xs text-gray-500">補習科目</div>
                                    <div className="font-semibold text-gray-900 dark:text-white truncate px-2">
                                        {student.subjects?.split(',')[0] || '未設定'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* 學生列表 - Desktop View (表格) */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-500 font-medium">
                            <th className="px-6 py-4">姓名 / 學校</th>
                            <th className="px-6 py-4">科目</th>
                            <th className="px-6 py-4">家長聯絡</th>
                            <th className="px-6 py-4 text-center">課程數</th>
                            <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {students.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <Link href={`/students/${student.id}`} className="flex items-center gap-3 hover:opacity-80">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                                            {student.user.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                {student.user.name}
                                            </div>
                                            <div className="text-xs text-gray-500">{student.school} {student.grade}</div>
                                        </div>
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                        {student.subjects}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-xs">
                                            <Phone size={12} /> {student.parentPhone}
                                        </div>
                                        {student.locationUrl && (
                                            <a href={student.locationUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                                                <MapPin size={12} /> 地點導航
                                            </a>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center text-gray-900 dark:text-white font-medium">
                                    {student._count.lessons}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <DeleteStudentButton id={student.id} name={student.user.name} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}