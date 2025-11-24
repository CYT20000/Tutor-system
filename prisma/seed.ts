const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🌱 開始播種資料 (Seeding)...')

    // 1. 清空資料庫 (注意順序，先刪除關聯表)
    await prisma.lesson.deleteMany()
    await prisma.exam.deleteMany()
    await prisma.assignment.deleteMany()
    await prisma.studentProfile.deleteMany()
    await prisma.tutorProfile.deleteMany()
    await prisma.user.deleteMany()

    // 2. 建立導師 (Tutors)
    const tutor1 = await prisma.user.create({
        data: {
            name: 'Ryan 老師',
            email: 'tutor1@example.com',
            password: 'password123',
            role: 'TUTOR',
            tutorProfile: {
                create: {
                    bio: '專精於升學考試與邏輯思考訓練。',
                }
            }
        },
        // [關鍵修正] 告訴 Prisma 建立完後，要把 tutorProfile 也回傳回來
        include: {
            tutorProfile: true
        }
    })

    // 雙重檢查：確保真的有拿到 Profile，不然下面會報錯
    if (!tutor1.tutorProfile) {
        throw new Error('導師資料建立失敗，無法取得 TutorProfile ID')
    }

    // 3. 建立學生 (Students)
    const studentsData = [
        { name: '王小明', grade: '高一', school: '建國中學', subjects: '數學, 物理' },
        { name: '李小華', grade: '高二', school: '北一女中', subjects: '英文' },
        { name: '張志豪', grade: '國三', school: '中正國中', subjects: '理化, 數學' },
    ]

    for (const s of studentsData) {
        const studentUser = await prisma.user.create({
            data: {
                name: s.name,
                email: `student_${s.name}@example.com`, // 假 Email
                password: 'password123',
                role: 'STUDENT',
                studentProfile: {
                    create: {
                        grade: s.grade,
                        school: s.school,
                        subjects: s.subjects,
                        parentPhone: '0912-345-678',
                        tutorId: tutor1.tutorProfile.id // 現在這裡就不會報錯了
                    }
                }
            }
        })

        // 4. 幫學生建立一些課程紀錄
        const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: studentUser.id } })

        if (studentProfile) {
            // 建立一筆「已完成」的過去課程 (綠燈)
            await prisma.lesson.create({
                data: {
                    startTime: new Date(new Date().setDate(new Date().getDate() - 7)), // 7天前
                    endTime: new Date(new Date().setDate(new Date().getDate() - 7)),
                    tutorId: tutor1.tutorProfile.id,
                    studentId: studentProfile.id,
                    subject: s.subjects.split(',')[0], // 取第一個科目
                    content: '第一章：基礎觀念複習',
                    homework: '習作 p.10-15',
                    isCompleted: true, // 設定為已完成
                    status: 'NORMAL'
                }
            })

            // 建立一筆「未來」的預定課程 (藍燈)
            await prisma.lesson.create({
                data: {
                    startTime: new Date(new Date().setDate(new Date().getDate() + 7)), // 7天後
                    endTime: new Date(new Date().setDate(new Date().getDate() + 7)),
                    tutorId: tutor1.tutorProfile.id,
                    studentId: studentProfile.id,
                    subject: s.subjects.split(',')[0],
                    isCompleted: false, // 未來課程尚未填寫
                    status: 'NORMAL'
                }
            })
        }
    }

    console.log('✅ 播種完成！已建立 Ryan 老師與 3 位測試學生。')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })