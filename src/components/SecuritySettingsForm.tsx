'use client';

import { changeSecuritySettings } from '@/app/actions';
import { Lock, KeyRound, Mail, Save, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';

export default function SecuritySettingsForm() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (formData: FormData) => {
        setIsPending(true);
        setError('');
        setSuccess(false);

        const result = await changeSecuritySettings(formData);

        if (result.success) {
            setSuccess(true);
            formRef.current?.reset(); // 成功後清空表單
            alert('修改成功！下次登入請使用新帳號密碼。');
        } else {
            setError(result.error || '發生未知錯誤');
        }
        setIsPending(false);
    };

    return (
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                    <Lock size={20} />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">帳號安全設定</h2>
            </div>

            <form ref={formRef} action={handleSubmit} className="p-6 space-y-6">

                {/* 錯誤/成功訊息提示 */}
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
                {success && (
                    <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">
                        ✅ 資料更新成功
                    </div>
                )}

                {/* 舊資料驗證區 */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">步驟 1:身分驗證</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">舊 Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input type="email" name="oldEmail" required placeholder="驗證舊帳號" className="w-full pl-10 p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">舊密碼</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input type="password" name="oldPassword" required placeholder="驗證舊密碼" className="w-full pl-10 p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 新資料設定區 */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">步驟 2:設定新資料</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">新 Email</label>
                        <input type="email" name="newEmail" required placeholder="輸入新的登入 Email" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">新密碼</label>
                            <input type="password" name="newPassword" required placeholder="設定新密碼" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">確認新密碼</label>
                            <input type="password" name="confirmPassword" required placeholder="再次輸入新密碼" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-70"
                    >
                        {isPending ? '更新中...' : <><Save size={18} /> 確認修改</>}
                    </button>
                </div>
            </form>
        </section>
    );
}
