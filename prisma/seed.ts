// prisma/seed.ts

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🌱 開始播種資料 (Seeding)...')

    // 1. 清空資料庫 (避免重複執行時錯誤)
    // 注意：刪除順序很重要，要先刪除關聯表 (Lesson, Exam) 再刪除主表 (User)
    await prisma.lesson.deleteMany()
    await prisma.exam.deleteMany()
    await prisma.assignment.deleteMany()
    await prisma.leave.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.studentProfile.deleteMany()
    await prisma.tutorProfile.deleteMany()
    await prisma.user.deleteMany()

    // 2. 建立導師 (Tutors)
    const tutor1 = await prisma.user.create({
        data: {
            name: '陳大師 (Math Tutor)',
            email: 'tutor1@example.com',
            password: 'password123', // 實際專案請記得加密
            role: 'TUTOR',
            tutorProfile: {
                create: {
                    subjects: '數學, 理化',
                    bio: '擁有 10 年教學經驗，專精於升學考試。',
                    availability: JSON.stringify({ weekdays: ['Mon', 'Wed', 'Fri'], hours: ['18:00', '21:00'] })
                }
            }
        }
    })

    const tutor2 = await prisma.user.create({
        data: {
            name: '林英文 (English Tutor)',
            email: 'tutor2@example.com',
            password: 'password123',
            role: 'TUTOR',
            tutorProfile: {
                create: {
                    subjects: '英文, 托福',
                    bio: '美歸碩士，強調互動式教學。',
                    availability: JSON.stringify({ weekdays: ['Tue', 'Thu'], hours: ['19:00', '21:00'] })
                }
            }
        }
    })

    // 3. 建立學生 (Students)
    const studentsData = [
        { name: '王小明', grade: '高一', school: '建國中學', subjects: '數學' },
        { name: '李小華', grade: '高二', school: '北一女中', subjects: '英文' },
        { name: '張志豪', grade: '國三', school: '中正國中', subjects: '理化' },
        { name: '陳雅婷', grade: '高三', school: '中山女高', subjects: '數學, 英文' },
        { name: '林冠宇', grade: '國二', school: '敦化國中', subjects: '英文' },
    ]

    for (const s of studentsData) {
        // 決定分配給哪位導師 (簡單邏輯：數學給 tutor1，英文給 tutor2)
        const assignedTutor = s.subjects.includes('數學') || s.subjects.includes('理化') ? tutor1 : tutor2

        // 取得剛建立的 tutor profile id
        const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: assignedTutor.id } })

        const studentUser = await prisma.user.create({
            data: {
                name: s.name,
                email: `student_${s.name}@example.com`, // 產生假 email
                password: 'password123',
                role: 'STUDENT',
                studentProfile: {
                    create: {
                        grade: s.grade,
                        school: s.school,
                        subjects: s.subjects,
                        parentName: `${s.name}的家長`,
                        parentPhone: '0912-345-678',
                        tutorId: tutorProfile?.id // 連結導師
                    }
                }
            }
        })

        // 4. 幫每位學生建立一些課程紀錄 (Lesson)
        // 建立一筆「過去」的課 (已完成)
        const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: studentUser.id } })

        if (studentProfile && tutorProfile) {
            await prisma.lesson.create({
                data: {
                    startTime: new Date(new Date().setDate(new Date().getDate() - 7)), // 7天前
                    endTime: new Date(new Date().setDate(new Date().getDate() - 7)),
                    tutorId: tutorProfile.id,
                    studentId: studentProfile.id,
                    content: '第一章：基礎觀念複習\n- 重點整理\n- 公式推導',
                    tags: JSON.stringify(['出席', '理解度高'])
                }
            })

            // 建立一筆「未來」的課 (下週)
            await prisma.lesson.create({
                data: {
                    startTime: new Date(new Date().setDate(new Date().getDate() + 7)), // 7天後
                    endTime: new Date(new Date().setDate(new Date().getDate() + 7)),
                    tutorId: tutorProfile.id,
                    studentId: studentProfile.id,
                    content: '第二章：進階題型解析',
                    tags: JSON.stringify([]) // 還沒上課，所以沒標籤
                }
            })

            // 5. 建立考試紀錄 (Exam)
            await prisma.exam.create({
                data: {
                    title: '第一次段考',
                    date: new Date(),
                    range: 'Ch1 - Ch3',
                    score: Math.floor(Math.random() * 40) + 60, // 隨機分數 60-100
                    studentId: studentProfile.id
                }
            })
        }
    }

    console.log('✅ 播種完成！建立了 2 位導師、5 位學生與相關課程。')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })