'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimeSlot {
    id: string;
    day: number; // 0-6 (Sunday-Saturday)
    hour: number; // 16-20 (4 PM - 8 PM)
    isAvailable: boolean;
    isBooked: boolean;
}

interface WeeklyCalendarProps {
    onSlotClick: (slot: TimeSlot, date: Date) => void;
    bookedSlots: Set<string>;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [16, 17, 18, 19]; // 4 PM to 7 PM (each slot is 1 hour)

// Mentor availability: Mon (1), Wed (3), Fri (5) from 4 PM - 8 PM
const AVAILABLE_DAYS = [1, 3, 5];

function formatHour(hour: number): string {
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
}

function getWeekDates(startDate: Date): Date[] {
    const dates: Date[] = [];
    const start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        dates.push(date);
    }
    return dates;
}

export default function WeeklyCalendar({ onSlotClick, bookedSlots }: WeeklyCalendarProps) {
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const now = new Date();
        now.setDate(now.getDate() - now.getDay());
        return now;
    });

    const weekDates = getWeekDates(currentWeekStart);

    const navigateWeek = (direction: 'prev' | 'next') => {
        setCurrentWeekStart(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
            return newDate;
        });
    };

    const getSlotKey = (date: Date, hour: number): string => {
        return `${date.toISOString().split('T')[0]}-${hour}`;
    };

    const isToday = (date: Date): boolean => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isPastSlot = (date: Date, hour: number): boolean => {
        const now = new Date();
        const slotTime = new Date(date);
        slotTime.setHours(hour, 0, 0, 0);
        return slotTime < now;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateWeek('prev')}
                        className="h-8 w-8"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateWeek('next')}
                        className="h-8 w-8"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <h3 className="text-lg font-semibold text-gray-900">
                    {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeekStart(new Date())}
                >
                    Today
                </Button>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                    {/* Day Headers */}
                    <div className="grid grid-cols-8 border-b border-gray-100">
                        <div className="p-3 text-center text-sm text-gray-500 font-medium border-r border-gray-100">
                            Time
                        </div>
                        {weekDates.map((date, index) => (
                            <div
                                key={index}
                                className={`p-3 text-center border-r border-gray-100 last:border-r-0
                  ${isToday(date) ? 'bg-orange-50' : ''}`}
                            >
                                <div className={`text-sm font-medium ${isToday(date) ? 'text-[#D97706]' : 'text-gray-500'}`}>
                                    {DAYS[index]}
                                </div>
                                <div className={`text-lg font-semibold ${isToday(date) ? 'text-[#D97706]' : 'text-gray-900'}`}>
                                    {date.getDate()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Time Slots */}
                    {TIME_SLOTS.map((hour) => (
                        <div key={hour} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0">
                            <div className="p-3 text-center text-sm text-gray-500 font-medium border-r border-gray-100 bg-gray-50">
                                {formatHour(hour)}
                            </div>
                            {weekDates.map((date, dayIndex) => {
                                const isAvailable = AVAILABLE_DAYS.includes(dayIndex);
                                const slotKey = getSlotKey(date, hour);
                                const isBooked = bookedSlots.has(slotKey);
                                const isPast = isPastSlot(date, hour);

                                const slot: TimeSlot = {
                                    id: slotKey,
                                    day: dayIndex,
                                    hour,
                                    isAvailable,
                                    isBooked,
                                };

                                return (
                                    <div
                                        key={dayIndex}
                                        className={`p-2 border-r border-gray-100 last:border-r-0 min-h-[60px]
                      ${isToday(date) ? 'bg-orange-50/50' : ''}`}
                                    >
                                        {isAvailable && !isPast && (
                                            <button
                                                onClick={() => !isBooked && onSlotClick(slot, date)}
                                                disabled={isBooked}
                                                className={`w-full h-full min-h-[44px] rounded-lg text-sm font-medium transition-all
                          ${isBooked
                                                        ? 'bg-green-100 text-green-700 border border-green-200 cursor-default'
                                                        : 'bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20 hover:bg-[#D97706]/20 hover:border-[#D97706]/40 cursor-pointer'
                                                    }`}
                                            >
                                                {isBooked ? 'Booked' : 'Open'}
                                            </button>
                                        )}
                                        {isAvailable && isPast && (
                                            <div className="w-full h-full min-h-[44px] rounded-lg text-sm font-medium bg-gray-100 text-gray-400 flex items-center justify-center">
                                                Past
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#D97706]/10 border border-[#D97706]/20"></div>
                    <span className="text-sm text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
                    <span className="text-sm text-gray-600">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200"></div>
                    <span className="text-sm text-gray-600">Unavailable</span>
                </div>
            </div>
        </div>
    );
}
