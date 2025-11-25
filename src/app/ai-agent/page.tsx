'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Lock, ShieldAlert } from 'lucide-react';
import { signIn } from 'next-auth/react'; // 用來驗證密碼

import { executeAIAction } from '@/app/actions'; // [新增] 引入執行官

type Message = {
    role: 'user' | 'ai';
    content: string;
};

export default function AIAgentPage() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: 'Ryan 老師您好！我是您的 AI 助理。我可以協助您管理系統，但在執行任何修改動作前，我會要求您驗證身分。' }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    // Sudo 模式 (驗證視窗) 狀態
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<string>(''); // AI 想要做的事
    const [pendingCommand, setPendingCommand] = useState<any>(null); // [新增] 暫存完整指令
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 自動捲動到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await res.json();
            let reply = data.reply;

            // 檢查 AI 是否回傳了 JSON 指令 (嘗試解析)
            try {
                // 清理一下可能包含在 markdown code block 裡的 JSON
                const cleanJson = reply.replace(/```json\n|\n```/g, '').trim();
                if (cleanJson.startsWith('{') && cleanJson.includes('REQUIRE_AUTH')) {
                    const command = JSON.parse(cleanJson);

                    // AI 想要執行敏感操作！觸發驗證流程
                    setPendingAction(command.operation || '執行敏感操作');
                    setPendingCommand(command); // [新增] 把 AI 給的 functionName 和 args 存起來
                    setShowAuthModal(true);

                    // 暫時顯示一個系統訊息
                    reply = `⚠️ 偵測到修改請求：${command.operation}。\n請在彈出的視窗中輸入密碼以授權執行。`;
                }
            } catch (e) {
                // 不是 JSON，就當作普通文字顯示
            }

            setMessages(prev => [...prev, { role: 'ai', content: reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: '抱歉，連線發生錯誤。' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // 處理密碼驗證
    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');

        // 這裡我們利用 next-auth 的 signIn 來驗證密碼，但不真的登入跳轉
        // 注意：您需要確保您的 user email 是固定的，或者從 Session 取得
        // 這裡假設是 Ryan 老師 (tutor1)
        const result = await signIn('credentials', {
            redirect: false,
            email: 'tutor1@example.com', // 這裡應該要是當前登入者的 email
            password: password,
        });

        if (result?.error) {
            setAuthError('密碼錯誤，授權失敗。');
        } else {
            // 驗證成功！
            setShowAuthModal(false);
            setPassword('');

            setMessages(prev => [...prev, { role: 'ai', content: `✅ 身分驗證通過！正在執行：${pendingAction}...` }]);

            // [新增] 真正的執行邏輯
            if (pendingCommand) {
                const result = await executeAIAction(pendingCommand.functionName, pendingCommand.args);

                if (result.success) {
                    setMessages(prev => [...prev, { role: 'ai', content: `🎉 執行成功！${pendingAction} 已完成。` }]);
                } else {
                    setMessages(prev => [...prev, { role: 'ai', content: `❌ 執行失敗：${result.error}` }]);
                }
                setPendingCommand(null); // 清空暫存
            }
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen bg-gray-50 dark:bg-gray-900 relative">
            {/* 聊天標題 */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-2 shadow-sm z-10">
                <Bot className="text-blue-600" />
                <h1 className="font-bold text-gray-900 dark:text-white">AI 智慧助理 (Gemini)</h1>
            </div>

            {/* 訊息顯示區 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm whitespace-pre-wrap ${msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-2xl rounded-tl-none animate-pulse">
                            思考中...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 輸入區 */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="flex gap-2 max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="輸入訊息 (例如：幫我刪除今天的課程)..."
                        className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading}
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>

            {/* 🔐 Sudo Modal (權限驗證視窗) */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
                        <div className="bg-red-50 dark:bg-red-900/20 p-6 flex flex-col items-center text-center border-b border-red-100 dark:border-red-900/30">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 text-red-600 rounded-full flex items-center justify-center mb-3">
                                <ShieldAlert size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-red-700 dark:text-red-400">權限驗證</h3>
                            <p className="text-sm text-red-600/80 dark:text-red-300/80 mt-1">
                                AI 正在請求執行以下操作：<br />
                                <span className="font-bold text-gray-900 dark:text-white underline">{pendingAction}</span>
                            </p>
                        </div>

                        <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="請輸入登入密碼以授權"
                                    className="w-full pl-10 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
                                    autoFocus
                                />
                            </div>

                            {authError && (
                                <p className="text-xs text-red-500 font-bold text-center">{authError}</p>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setShowAuthModal(false); setPassword(''); }}
                                    className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-md shadow-red-600/20"
                                >
                                    確認授權
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
