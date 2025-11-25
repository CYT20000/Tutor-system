import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // [新增] 引入資料庫

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        // 1. [新增] 先抓取目前所有的學生資料 (讓 AI 知道名字對應的 ID)
        const students = await prisma.studentProfile.findMany({
            include: { user: true }
        });

        // 把學生資料整理成 AI 看得懂的清單字串
        const studentsList = students.map(s => `- 姓名: ${s.user.name}, ID: ${s.id}`).join('\n');

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        // 2. [修改] 設定更聰明的 Prompt
        const prompt = `
      你是一個擁有最高權限的家教系統管理員 AI。
      
      【目前的學生名單與 ID】：
      ${studentsList}
      
      【你的任務】：
      判斷使用者的指令。
      
      情況 A：如果使用者想「刪除學生」，請務必從名單中找到對應的 ID。
      並回傳嚴格的 JSON 格式 (不要有 markdown 標記)：
      {"action": "REQUIRE_AUTH", "operation": "刪除學生：[學生姓名]", "functionName": "deleteStudent", "args": {"studentId": "[找到的ID]"}}
      
      情況 B：如果使用者想「查詢」或「閒聊」，請直接用繁體中文回答。
      
      使用者說：${message}
    `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();

        // 清理可能的 Markdown 標記 (例如 \`\`\`json ... \`\`\`)
        text = text.replace(/```json|```/g, '').trim();

        return NextResponse.json({ reply: text });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "AI 連線發生錯誤" }, { status: 500 });
    }
}
