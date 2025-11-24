import { prisma } from '@/lib/prisma';
import { createLesson } from '@/app/actions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LessonForm from '@/components/LessonForm';

export default async function NewLessonPage() {
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">新增課程紀錄</h1>
            </div>
            {/* 使用元件 */}
            <LessonForm students={students} action={createLesson} />
        </div>
    );
}
