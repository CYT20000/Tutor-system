import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query'], // 這會讓您在終端機看到它查了什麼資料，除錯超好用
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma