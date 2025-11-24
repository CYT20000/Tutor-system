'use client';

import { useState, useEffect } from 'react';

export default function Greeting({ name }: { name: string }) {
    const [greeting, setGreeting] = useState(''); // 預設為空，避免伺服器與用戶端不一致

    useEffect(() => {
        const now = new Date();
        const hour = now.getHours();

        // 設定日出時間 (預設為 6:00)
        const SUNRISE_HOUR = 6;

        let message = '';

        if (hour >= SUNRISE_HOUR && hour < 12) {
            // 日出 (06:00) ~ 11:59
            message = '早安';
        } else if (hour >= 12 && hour < 18) {
            // 12:00 ~ 17:59
            message = '午安';
        } else if (hour >= 18 && hour < 22) {
            // 18:00 ~ 21:59
            message = '夜安';
        } else {
            // 22:00 ~ 隔日日出前 (05:59)
            message = '晚安';
        }

        setGreeting(message);
    }, []);

    // 如果還沒計算好 (載入中)，先顯示基本的 "您好" 或不顯示
    if (!greeting) {
        return <h1 className="text-3xl font-bold text-gray-900 dark:text-white">您好，{name} 老師 👋</h1>;
    }

    return (
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {greeting}，{name} 老師 👋
        </h1>
    );
}
