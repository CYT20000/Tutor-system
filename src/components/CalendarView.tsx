'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation'; // [新增] 用於頁面跳轉

type Lesson = {
    id: string;
    startTime: Date;
    endTime: Date;
    subject: string;
    isCompleted: boolean;
    student: {
        user: { name: string };
        grade: string | null;
    };
};

export default function CalendarView({ lessons }: { lessons: Lesson[] }) {
    const router = useRouter(); // 初始化路由
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // 判斷課程狀態顏色
    const getLessonStatus = (lesson: Lesson) => {
        const now = new Date();
        const lessonTime = new Date(lesson.startTime);

        if (lesson.isCompleted) return 'green'; // 已填寫 (綠色)
        if (lessonTime > now) return 'blue';    // 預定課程 (藍色) - 未來
        return 'red';                           // 過期未填寫 (紅色) - 過去
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'green': return 'bg-green-500 text-white';
            case 'red': return 'bg-red-500 text-white';
            case 'blue': return 'bg-blue-500 text-white';
            default: return 'bg-gray-400 text-white';
        }
    };

    // [新增] 處理課程卡片點擊
    const handleLessonClick = (lesson: Lesson) => {
        const status = getLessonStatus(lesson);

        if (status === 'red') {
            // 紅色圓圈：跳出提示並引導
            const confirmFill = window.confirm(`您尚未填寫「${lesson.student.user.name}」的課程紀錄。\n\n是否現在前往填寫？`);
            if (confirmFill) {
                router.push(`/lessons/${lesson.id}/edit`);
            }
        } else {
            // 綠色或藍色：直接進入編輯
            router.push(`/lessons/${lesson.id}/edit`);
        }
    };

    const getLessonsForDate = (day: number) => {
        return lessons.filter(l => {
            const d = new Date(l.startTime);
            return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
        });
    };

    const selectedLessons = lessons.filter(l => {
        const d = new Date(l.startTime);
        return (
            d.getFullYear() === selectedDate.getFullYear() &&
            d.getMonth() === selectedDate.getMonth() &&
            d.getDate() === selectedDate.getDate()
        );
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const renderCalendarDays = () => {
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) days.push(<div key={`empty-${i}`} className="h-14 md:h-24 bg-gray-50/30 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800"></div>);

        for (let day = 1; day <= daysInMonth; day++) {
            const dayLessons = getLessonsForDate(day);
            const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month;

            days.push(
                <button
                    key={day}
                    onClick={() => setSelectedDate(new Date(year, month, day))}
                    className={`h-14 md:h-24 p-1 border border-gray-100 dark:border-gray-700 flex flex-col items-start justify-start transition-all ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-inset ring-blue-500' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isSelected ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                        {day}
                    </span>

                    {/* 課程圓點區域 */}
                    <div className="flex flex-wrap gap-1 mt-1 w-full content-start">
                        {dayLessons.map((lesson) => {
                            const status = getLessonStatus(lesson);
                            const lastName = lesson.student.user.name.slice(-1);

                            return (
                                <div
                                    key={lesson.id}
                                    className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold shadow-sm ${getStatusColor(status)}`}
                                    title={`${lesson.student.user.name} - ${lesson.subject}`}
                                >
                                    {lastName}
                                </div>
                            );
                        })}
                    </div>
                </button>
            );
        }
        return days;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                {/* 月份切換 */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="text-blue-600" />
                        {year}年 {month + 1}月
                    </h2>
                    <div className="flex gap-1">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronLeft size={20} /></button>
                        <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronRight size={20} /></button>
                    </div>
                </div>

                <div className="grid grid-cols-7 text-center mb-1 text-xs font-bold text-gray-400">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="grid grid-cols-7">
                    {renderCalendarDays()}
                </div>

                {/* 圖例說明 */}
                <div className="mt-4 flex gap-4 text-xs text-gray-500 justify-end">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> 預定課程</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> 未填紀錄</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> 已完成</div>
                </div>
            </div>

            {/* 右側：選中日期的行程 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-fit">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                    {selectedDate.getMonth() + 1}月 {selectedDate.getDate()}日 行程
                </h3>

                <div className="space-y-3">
                    {selectedLessons.length > 0 ? (
                        selectedLessons.map(lesson => {
                            const status = getLessonStatus(lesson);
                            return (
                                // [修改] 將 Link 改為 div 並加上 onClick 事件
                                <div
                                    key={lesson.id}
                                    onClick={() => handleLessonClick(lesson)} // 綁定點擊事件
                                    className={`cursor-pointer p-3 rounded-lg border flex items-center justify-between hover:opacity-80 transition-opacity ${status === 'green' ? 'bg-green-50 border-green-200 dark:bg-green-900/10' :
                                            status === 'red' ? 'bg-red-50 border-red-200 dark:bg-red-900/10' :
                                                'bg-blue-50 border-blue-200 dark:bg-blue-900/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-full absolute left-0 top-0 bottom-0 rounded-l-lg ${status === 'green' ? 'bg-green-500' : status === 'red' ? 'bg-red-500' : 'bg-blue-500'
                                            }`}></div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {lesson.student.user.name}
                                                <span className="text-xs font-normal text-gray-500">({lesson.subject})</span>
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(lesson.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 狀態提示 */}
                                    <div>
                                        {status === 'green' && <CheckCircle className="text-green-500" size={20} />}
                                        {status === 'red' && <AlertCircle className="text-red-500" size={20} />}
                                        {status === 'blue' && <span className="text-xs font-bold text-blue-500 px-2 py-1 bg-white dark:bg-gray-700 rounded-full">未開始</span>}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-gray-400">本日無排定課程</div>
                    )}
                </div>
            </div>
        </div>
    );
}
