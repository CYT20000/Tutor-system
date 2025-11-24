'use server'; // 關鍵字：這是一個在伺服器端執行的檔案

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// 1. 刪除學生的動作 (終極版：刪除 User 帳號)
export async function deleteStudent(studentId: string) {
    try {
        // 1. 先找出這位學生的 User ID
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { id: studentId },
            select: { userId: true }
        });

        if (studentProfile) {
            // 2. 刪除源頭 User 帳號
            // 由於我們在 schema 設定了 onDelete: Cascade，
            // 這動作會自動觸發連鎖反應，刪除 Profile，進而刪除所有的 Lessons, Exams, Assignments
            await prisma.user.delete({
                where: { id: studentProfile.userId }
            });
        } else {
            // 如果找不到 profile (理論上不該發生)，則嘗試直接刪除 profile 以防萬一
            await prisma.studentProfile.delete({
                where: { id: studentId }
            });
        }

        // 3. 強制刷新所有相關頁面 (確保前端快取更新)
        revalidatePath('/students');       // 學生列表
        revalidatePath('/lessons');        // 課程列表
        revalidatePath('/schedule');       // 行事曆 (關鍵！)
        revalidatePath('/course-changes'); // 課程異動 (關鍵！)
        revalidatePath('/exams');          // 考試列表
        revalidatePath('/');               // 儀表板

        return { success: true };
    } catch (error) {
        console.error('刪除失敗:', error);
        return { success: false, error: '刪除失敗' };
    }
}

// 2. 新增課程的動作
// 2. 新增課程的動作 (更新版)
export async function createLesson(formData: FormData) {
    // 從表單取得資料
    const studentId = formData.get('studentId') as string;
    const subject = formData.get('subject') as string;         // [新增] 抓取科目
    const dateStr = formData.get('date') as string;
    const timeStr = formData.get('time') as string;

    const content = formData.get('content') as string;
    const homework = formData.get('homework') as string;
    const nextExamScope = formData.get('nextExamScope') as string;
    const note = formData.get('note') as string;

    // 結合日期與時間
    const startDateTime = new Date(`${dateStr}T${timeStr}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 預設一小時

    // 抓取導師 ID
    const tutorUser = await prisma.user.findFirst({
        where: { role: 'TUTOR' },
        include: { tutorProfile: true }
    });

    if (!tutorUser?.tutorProfile) throw new Error('找不到導師');

    await prisma.lesson.create({
        data: {
            studentId: studentId,
            tutorId: tutorUser.tutorProfile.id,
            subject,
            startTime: startDateTime,
            endTime: endDateTime,
            content: content,
            homework: homework,
            nextExamScope: nextExamScope,
            note: note,
            tags: '[]',
            isCompleted: true, // [關鍵] 手動新增的視為已完課
        },
    });

    revalidatePath('/lessons');
    redirect('/lessons');
}

// 3. 刪除課程 (修正版：改為重置課程狀態)
export async function deleteLesson(lessonId: string) {
    try {
        // 我們不執行 delete，而是 update
        // 把內容清空，並把 isCompleted 設為 false (變回紅燈)
        await prisma.lesson.update({
            where: { id: lessonId },
            data: {
                content: null,
                homework: null,
                nextExamScope: null,
                note: null,
                isCompleted: false, // [關鍵] 變回未完成 (紅色)
            },
        });

        revalidatePath('/lessons');
        revalidatePath('/schedule');
        return { success: true };
    } catch (error) {
        console.error('重置課程失敗:', error);
        return { success: false, error: '重置失敗' };
    }
}

// 4. 更新課程
export async function updateLesson(formData: FormData) {
    const id = formData.get('id') as string;
    const studentId = formData.get('studentId') as string;
    const subject = formData.get('subject') as string;         // [新增]
    const dateStr = formData.get('date') as string;
    const timeStr = formData.get('time') as string;

    const content = formData.get('content') as string;
    const homework = formData.get('homework') as string;
    const nextExamScope = formData.get('nextExamScope') as string;
    const note = formData.get('note') as string;

    // 結合日期與時間
    const startDateTime = new Date(`${dateStr}T${timeStr}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 預設一小時

    await prisma.lesson.update({
        where: { id },
        data: {
            studentId,
            subject,
            startTime: startDateTime,
            endTime: endDateTime,
            content,
            homework,
            nextExamScope,
            note,
            isCompleted: true, // [關鍵] 更新後視為已完課
        },
    });

    revalidatePath('/lessons');
    redirect('/lessons');
}

// 5. 新增學生
export async function createStudent(formData: FormData) {
    const name = formData.get('name') as string;
    const school = formData.get('school') as string;
    const grade = formData.get('grade') as string;
    const subjects = formData.get('subjects') as string;
    const parentContact = formData.get('parentContact') as string;
    const locationUrl = formData.get('locationUrl') as string;

    // 1. 取得導師 ID
    const tutorUser = await prisma.user.findFirst({
        where: { role: 'TUTOR' },
        include: { tutorProfile: true }
    });

    if (!tutorUser?.tutorProfile) throw new Error('找不到導師');

    // 2. 建立 User + StudentProfile
    // 因為 User 需要 email，我們這裡暫時自動生成一個假的
    const fakeEmail = `student_${Date.now()}@system.com`;

    await prisma.user.create({
        data: {
            name,
            email: fakeEmail,
            password: 'password123', // 預設密碼
            role: 'STUDENT',
            studentProfile: {
                create: {
                    school,
                    grade,
                    subjects,
                    parentPhone: parentContact, // 將聯絡方式存入 phone 欄位
                    locationUrl: locationUrl,   // 存入地圖連結
                    tutorId: tutorUser.tutorProfile.id,
                }
            }
        }
    });

    revalidatePath('/students');
    redirect('/students');
}

// 6. 更新學生資料
export async function updateStudent(formData: FormData) {
    const id = formData.get('id') as string; // StudentProfile ID
    const name = formData.get('name') as string;
    const school = formData.get('school') as string;
    const grade = formData.get('grade') as string;
    const subjects = formData.get('subjects') as string;
    const parentContact = formData.get('parentContact') as string;
    const locationUrl = formData.get('locationUrl') as string;

    // 1. 先查出對應的 User ID (因為姓名存在 User 表)
    const studentProfile = await prisma.studentProfile.findUnique({
        where: { id },
        select: { userId: true }
    });

    if (!studentProfile) throw new Error('找不到學生資料');

    // 2. 使用 Transaction 同時更新 User 和 StudentProfile
    await prisma.$transaction([
        prisma.user.update({
            where: { id: studentProfile.userId },
            data: { name }
        }),
        prisma.studentProfile.update({
            where: { id },
            data: {
                school,
                grade,
                subjects,
                parentPhone: parentContact,
                locationUrl
            }
        })
    ]);

    // 更新快取並導回詳情頁
    revalidatePath(`/students/${id}`);
    revalidatePath('/students');
    redirect(`/students/${id}`);
}

// 7. [新增] 設定固定課表並生成課程
export async function generateRecurringLessons(formData: FormData) {
    const studentId = formData.get('studentId') as string;
    const dayOfWeek = parseInt(formData.get('dayOfWeek') as string); // 0=週日, 1=週一...
    const timeStr = formData.get('time') as string; // "19:00"
    const duration = 60; // 預設 60 分鐘
    const subject = formData.get('subject') as string;

    // 1. 儲存這個設定到 StudentProfile
    const scheduleSetting = JSON.stringify([{ day: dayOfWeek, time: timeStr, subject }]);
    await prisma.studentProfile.update({
        where: { id: studentId },
        data: { fixedSchedule: scheduleSetting }
    });

    // 2. 批量生成未來 3 個月 (12週) 的課程
    const tutorUser = await prisma.user.findFirst({
        where: { role: 'TUTOR' },
        include: { tutorProfile: true }
    });

    if (!tutorUser?.tutorProfile) throw new Error('找不到導師');

    const lessonsToCreate = [];
    let currentDate = new Date();

    // 調整到最近的該星期幾
    while (currentDate.getDay() !== dayOfWeek) {
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // 往後推 12 週
    for (let i = 0; i < 12; i++) {
        // 設定開始時間
        const lessonStart = new Date(currentDate);
        const [hours, minutes] = timeStr.split(':').map(Number);
        lessonStart.setHours(hours, minutes, 0, 0);

        // 設定結束時間
        const lessonEnd = new Date(lessonStart.getTime() + duration * 60 * 1000);

        lessonsToCreate.push({
            tutorId: tutorUser.tutorProfile.id,
            studentId: studentId,
            subject: subject,
            startTime: lessonStart,
            endTime: lessonEnd,
            status: 'NORMAL',
            content: '',
            tags: '[]',
            isCompleted: false // [關鍵] 剛生成的只是排程，還沒上課
        });

        // 下一週
        currentDate.setDate(currentDate.getDate() + 7);
    }

    // 寫入資料庫
    await prisma.lesson.createMany({
        data: lessonsToCreate
    });

    revalidatePath(`/students/${studentId}`);
    revalidatePath('/schedule');
    revalidatePath('/lessons');
    redirect(`/students/${studentId}`);
}

// 8. [新增] 處理課程異動 (取消或調課)
// 8. [新增] 處理課程異動 (取消或調課)
export async function updateLessonStatus(formData: FormData) {
    const lessonId = formData.get('lessonId') as string;
    const actionType = formData.get('actionType') as string; // 'CANCEL' or 'RESCHEDULE'

    if (actionType === 'CANCEL') {
        await prisma.lesson.update({
            where: { id: lessonId },
            data: { status: 'CANCELLED' }
        });
    } else if (actionType === 'RESCHEDULE') {
        const newDateStr = formData.get('newDate') as string;
        const newTimeStr = formData.get('newTime') as string;

        const newStart = new Date(`${newDateStr}T${newTimeStr}`);
        const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000); // 假設時長不變

        await prisma.lesson.update({
            where: { id: lessonId },
            data: {
                status: 'RESCHEDULED',
                startTime: newStart,
                endTime: newEnd,
            }
        });
    }

    revalidatePath('/schedule');
    revalidatePath('/course-changes');
}



// 11. 更新系統設定 (導師資料與偏好)
export async function updateSettings(formData: FormData) {
    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const phone = formData.get('phone') as string;

    const tutorUser = await prisma.user.findFirst({
        where: { role: 'TUTOR' },
        include: { tutorProfile: true }
    });

    if (!tutorUser || !tutorUser.tutorProfile) throw new Error('找不到導師');

    // 更新 User 表 (姓名與電話)
    await prisma.user.update({
        where: { id: tutorUser.id },
        data: {
            name,
            phone
        }
    });

    // 更新 TutorProfile 表 (簡介)
    await prisma.tutorProfile.update({
        where: { id: tutorUser.tutorProfile.id },
        data: { bio }
    });

    revalidatePath('/settings');
    revalidatePath('/');
}

// 12. 危險操作：重置所有課程
export async function resetAllLessons() {
    const tutorUser = await prisma.user.findFirst({
        where: { role: 'TUTOR' },
        include: { tutorProfile: true }
    });

    if (!tutorUser?.tutorProfile) return;

    // 刪除該導師的所有課程
    await prisma.lesson.deleteMany({
        where: { tutorId: tutorUser.tutorProfile.id }
    });

    revalidatePath('/');
    revalidatePath('/schedule');
    revalidatePath('/lessons');
}

// 13. [新增] 徹底刪除課程 (連同排程一起消失)
export async function hardDeleteLesson(lessonId: string) {
    try {
        // 這是真的 Delete，資料會直接消失
        await prisma.lesson.delete({
            where: { id: lessonId },
        });

        // 重新整理所有相關頁面
        revalidatePath('/schedule');
        revalidatePath('/lessons');
        revalidatePath('/');
        revalidatePath('/course-changes');

        return { success: true };
    } catch (error) {
        console.error('刪除失敗:', error);
        return { success: false, error: '刪除失敗' };
    }
}
