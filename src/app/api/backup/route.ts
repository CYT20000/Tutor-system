import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    // 1. 抓取所有重要資料
    const students = await prisma.studentProfile.findMany({
        include: { user: true }
    });

    const lessons = await prisma.lesson.findMany();
    const exams = await prisma.exam.findMany();

    // 2. 組合資料
    const data = {
        timestamp: new Date().toISOString(),
        students,
        lessons,
        exams
    };

    // 3. 回傳 JSON 檔案
    return new NextResponse(JSON.stringify(data, null, 2), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="tutor_backup_${new Date().toISOString().split('T')[0]}.json"`,
        },
    });
}
