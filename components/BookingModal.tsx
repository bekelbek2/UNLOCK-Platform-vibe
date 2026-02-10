'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, User } from 'lucide-react';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (notes: string) => void;
    mentorName: string;
    date: Date | null;
    hour: number;
    isLoading?: boolean;
}

function formatHour(hour: number): string {
    if (hour === 12) return '12:00 PM';
    if (hour > 12) return `${hour - 12}:00 PM`;
    return `${hour}:00 AM`;
}

function formatHourRange(hour: number): string {
    const start = formatHour(hour);
    const end = formatHour(hour + 1);
    return `${start} - ${end}`;
}

export default function BookingModal({
    isOpen,
    onClose,
    onConfirm,
    mentorName,
    date,
    hour,
    isLoading = false,
}: BookingModalProps) {
    const [notes, setNotes] = useState('');

    const handleConfirm = () => {
        onConfirm(notes);
        setNotes('');
    };

    const handleClose = () => {
        setNotes('');
        onClose();
    };

    const formattedDate = date?.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Book Session</DialogTitle>
                    <DialogDescription>
                        Schedule a mentoring session with your assigned mentor.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Mentor Info */}
                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100">
                        <div className="h-12 w-12 rounded-full bg-[#D97706] flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Mentor</p>
                            <p className="font-semibold text-gray-900">{mentorName}</p>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Date</p>
                                <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Time</p>
                                <p className="text-sm font-medium text-gray-900">{formatHourRange(hour)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">What do you want to discuss?</Label>
                        <Textarea
                            id="notes"
                            placeholder="Share the topics you'd like to cover during this session..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[100px] resize-none"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="bg-[#D97706] hover:bg-[#B45309] text-white"
                    >
                        {isLoading ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
