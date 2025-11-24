import { prisma } from '@/lib/prisma';
import { updateLesson } from '@/app/actions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LessonForm from '@/components/LessonForm';
import HardDeleteButton from '@/components/HardDeleteButton';

export default async function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const lesson = await prisma.lesson.findUnique({
        where: { id },
    });

    if (!lesson) return <div>找不到課程資料</div>;

    const tutorUser = await prisma.user.findFirst({
        where: { role: 'TUTOR' },
        include: { tutorProfile: true }
    });

    const students = await prisma.studentProfile.findMany({
        where: { tutorId: tutorUser?.tutorProfile?.id },
        include: { user: true }
    });

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/lessons" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">編輯課程紀錄</h1>
            </div>
            {/* 傳入舊資料 initialData */}
            <LessonForm students={students} action={updateLesson} initialData={lesson} />

            {/* [新增] 危險操作區塊 */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                    <div className="text-sm text-gray-500">
                        <p className="font-bold text-gray-700 dark:text-gray-300">移除此時段？</p>
                        <p>若此為錯誤的排程，可將其徹底移除。</p>
                    </div>
                    <HardDeleteButton id={lesson.id} />
                </div>
            </div>
        </div>
    );
}
