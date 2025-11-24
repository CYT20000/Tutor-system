/*
  Warnings:

  - You are about to drop the `Leave` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `parentName` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `preferredTimes` on the `StudentProfile` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Leave";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "subject" TEXT NOT NULL DEFAULT '一般',
    "content" TEXT,
    "homework" TEXT,
    "nextExamScope" TEXT,
    "note" TEXT,
    "tags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NORMAL',
    "tutorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lesson_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "TutorProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Lesson_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("content", "createdAt", "endTime", "homework", "id", "nextExamScope", "note", "startTime", "studentId", "subject", "tags", "tutorId", "updatedAt") SELECT "content", "createdAt", "endTime", "homework", "id", "nextExamScope", "note", "startTime", "studentId", "subject", "tags", "tutorId", "updatedAt" FROM "Lesson";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
CREATE TABLE "new_StudentProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "grade" TEXT,
    "school" TEXT,
    "subjects" TEXT,
    "fixedSchedule" TEXT,
    "parentPhone" TEXT,
    "parentEmail" TEXT,
    "locationUrl" TEXT,
    "tutorId" TEXT,
    CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentProfile_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "TutorProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StudentProfile" ("grade", "id", "locationUrl", "parentEmail", "parentPhone", "school", "subjects", "tutorId", "userId") SELECT "grade", "id", "locationUrl", "parentEmail", "parentPhone", "school", "subjects", "tutorId", "userId" FROM "StudentProfile";
DROP TABLE "StudentProfile";
ALTER TABLE "new_StudentProfile" RENAME TO "StudentProfile";
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
