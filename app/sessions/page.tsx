'use client';

import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import Header from '@/components/Header';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import BookingModal from '@/components/BookingModal';
import { toast } from 'sonner';
import { Calendar, Video } from 'lucide-react';

interface TimeSlot {
    id: string;
    day: number;
    hour: number;
    isAvailable: boolean;
    isBooked: boolean;
}

const MENTOR_NAME = 'Dr. Sarah Johnson';

export default function SessionsPage() {
    const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isBooking, setIsBooking] = useState(false);

    const handleSlotClick = (slot: TimeSlot, date: Date) => {
        setSelectedSlot(slot);
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const handleConfirmBooking = async (notes: string) => {
        if (!selectedSlot) return;

        setIsBooking(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Add slot to booked set
        setBookedSlots((prev) => new Set([...prev, selectedSlot.id]));

        // Show success toast
        toast.success('Session booked successfully!', {
            description: `Your session with ${MENTOR_NAME} has been confirmed.`,
        });

        setIsBooking(false);
        setIsModalOpen(false);
        setSelectedSlot(null);
        setSelectedDate(null);
    };

    return (
        <MainLayout>
            <Header
                title="Sessions"
                subtitle="Book and manage your mentoring sessions."
            />

            {/* Info Cards */}
            <div className="px-8 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mentor Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-[#D97706] flex items-center justify-center">
                                <Video className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Your Assigned Mentor</p>
                                <p className="text-lg font-semibold text-gray-900">{MENTOR_NAME}</p>
                                <p className="text-sm text-gray-500">Available: Mon, Wed, Fri • 4-8 PM</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                                <Calendar className="h-7 w-7 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Sessions Booked</p>
                                <p className="text-lg font-semibold text-gray-900">{bookedSlots.size} sessions</p>
                                <p className="text-sm text-gray-500">Click an available slot to book</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="px-8 pb-8">
                <WeeklyCalendar
                    onSlotClick={handleSlotClick}
                    bookedSlots={bookedSlots}
                />
            </div>

            {/* Booking Modal */}
            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmBooking}
                mentorName={MENTOR_NAME}
                date={selectedDate}
                hour={selectedSlot?.hour || 16}
                isLoading={isBooking}
            />
        </MainLayout>
    );
}
