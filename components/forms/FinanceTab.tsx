'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Schema
const financeSchema = z.object({
    expectedFamilyContribution: z.number({
        required_error: 'Expected family contribution is required',
        invalid_type_error: 'Please enter a valid number',
    }).min(0, 'Amount must be a positive number'),
});

type FinanceFormData = z.infer<typeof financeSchema>;

// Helper function to format number with commas
function formatWithCommas(value: string): string {
    // Remove non-numeric characters except for the number itself
    const numericValue = value.replace(/[^\d]/g, '');
    if (!numericValue) return '';

    // Convert to number and format with commas
    const number = parseInt(numericValue, 10);
    return number.toLocaleString('en-US');
}

// Helper function to parse formatted string to number
function parseFormattedNumber(value: string): number {
    const numericValue = value.replace(/[^\d]/g, '');
    return numericValue ? parseInt(numericValue, 10) : 0;
}

export default function FinanceTab() {
    const [displayValue, setDisplayValue] = useState('');

    const form = useForm<FinanceFormData>({
        resolver: zodResolver(financeSchema),
        defaultValues: {
            expectedFamilyContribution: undefined,
        },
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const formatted = formatWithCommas(rawValue);
        setDisplayValue(formatted);

        // Update form value with raw number
        const numericValue = parseFormattedNumber(rawValue);
        form.setValue('expectedFamilyContribution', numericValue, { shouldValidate: true });
    };

    const onSubmit = (data: FinanceFormData) => {
        console.log('Finance data:', data);
        toast.success('Financial details saved');
    };

    return (
        <div className="max-w-xl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-[#C26E26]" />
                        Financial Information
                    </CardTitle>
                    <CardDescription>
                        Please provide your estimated financial contribution for your education.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="expectedFamilyContribution"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>
                                            Expected Family Contribution (per year) <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                                    $
                                                </span>
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    placeholder="e.g. 5,000"
                                                    value={displayValue}
                                                    onChange={handleInputChange}
                                                    className="pl-8"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full bg-[#C26E26] hover:bg-[#A55A1F] text-white"
                            >
                                Save Finance Info
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
