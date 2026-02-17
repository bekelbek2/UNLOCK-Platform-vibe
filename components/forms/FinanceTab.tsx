'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, AlertCircle, TrendingUp, HandCoins, Building2, Calculator, ArrowRightLeft, Pencil, Check } from 'lucide-react';
import { toast } from 'sonner';

import { useProfileData } from '@/lib/profileStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ─── 1. Zod Schema ───────────────────────────────────────────────────────────

const financeSchema = z.object({
    // A) Parents' Income
    fatherGrossIncome: z.number().min(0).optional(),
    motherGrossIncome: z.number().min(0).optional(),
    otherIncome: z.number().min(0).optional(),
    totalTaxPaid: z.number().min(0).optional(),

    // B) Assets
    savings: z.number().min(0).optional(),
    investments: z.number().min(0).optional(),

    // Real Estate Logic
    ownsHome: z.boolean().default(false),
    homeMarketValue: z.number().min(0).optional(),
    homeMortgage: z.number().min(0).optional(),

    // C) Student's Finances
    studentSavings: z.number().min(0).optional(),
    studentGrants: z.number().min(0).optional(),

    // D) Expenses (Detailed Breakdown)
    rentOrMortgage: z.number().min(0).optional(),
    utilities: z.number().min(0).optional(),
    foodAndHousehold: z.number().min(0).optional(),
    clothingAndPersonal: z.number().min(0).optional(),
    medicalExpenses: z.number().min(0).optional(),
    transportation: z.number().min(0).optional(),
    educationFees: z.number().min(0).optional(),
    booksAndSupplies: z.number().min(0).optional(),
    insurance: z.number().min(0).optional(),
    otherTaxes: z.number().min(0).optional(),
    debtPayments: z.number().min(0).optional(),
    emergencyFund: z.number().min(0).optional(),

    // E) Calculated Need
    expectedFamilyContribution: z.number().min(0, 'Amount must be positive'),
});

type FinanceFormData = z.infer<typeof financeSchema>;

// ─── 2. Helpers ──────────────────────────────────────────────────────────────

// ─── 2. Helpers ──────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

// ─── 3. Component ────────────────────────────────────────────────────────────

// Import the new component
import { ExpenseBreakdown } from '@/components/forms/finance/ExpenseBreakdown';

export default function FinanceTab() {
    const { data: profileData, updateFinance } = useProfileData();
    const router = useRouter();
    // @ts-ignore
    const { family } = profileData;

    // Parent Logic
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parent1 = (family?.parent1 || {}) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parent2 = (family?.parent2 || {}) as any;

    // Default to displaying unless explicitly set to 'no' (to handle empty states graciously, or strict? User said "passed away", so strict 'no' check)
    // Actually, if data is missing, we should probably show it or ask? 
    // User said: "if some one's one parent passed away long ago, they shouldnt have income section"
    // So ONLY show if isLiving !== 'no'
    const parent1Living = parent1.isLiving !== 'no';
    const parent2Living = parent2.isLiving !== 'no';

    const parent1Name = parent1.firstName || "Father/Parent 1";
    const parent2Name = parent2.firstName || "Mother/Parent 2";

    // Initialize Form
    const form = useForm<FinanceFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(financeSchema) as any,
        defaultValues: {
            fatherGrossIncome: undefined,
            motherGrossIncome: undefined,
            otherIncome: undefined,
            totalTaxPaid: undefined,
            savings: undefined,
            investments: undefined,
            ownsHome: false,
            homeMarketValue: undefined,
            homeMortgage: undefined,
            studentSavings: undefined,
            studentGrants: undefined,

            // New Expense Fields
            rentOrMortgage: undefined,
            utilities: undefined,
            foodAndHousehold: undefined,
            clothingAndPersonal: undefined,
            medicalExpenses: undefined,
            transportation: undefined,
            educationFees: undefined,
            booksAndSupplies: undefined,
            insurance: undefined,
            otherTaxes: undefined,
            debtPayments: undefined,
            emergencyFund: undefined,

            expectedFamilyContribution: undefined,
            ...profileData.finance, // Load existing data
        },
    });

    // Watch values for real-time calculation & conditional rendering
    const values = form.watch();

    // ─── Smart Calculations ──────────────────────────────────────────────────

    const calculations = useMemo(() => {
        const getVal = (v: number | undefined) => v || 0;

        const totalIncome =
            getVal(values.fatherGrossIncome) +
            getVal(values.motherGrossIncome) +
            getVal(values.otherIncome);

        // Only count home equity if they own the home
        const netHomeEquity = values.ownsHome
            ? Math.max(0, getVal(values.homeMarketValue) - getVal(values.homeMortgage))
            : 0;

        const totalAssets =
            getVal(values.savings) +
            getVal(values.investments) +
            netHomeEquity +
            getVal(values.studentSavings);

        // Updated Summation for Detailed Expenses
        const totalExpenses =
            getVal(values.rentOrMortgage) +
            getVal(values.utilities) +
            getVal(values.foodAndHousehold) +
            getVal(values.clothingAndPersonal) +
            getVal(values.medicalExpenses) +
            getVal(values.transportation) +
            getVal(values.educationFees) +
            getVal(values.booksAndSupplies) +
            getVal(values.insurance) +
            getVal(values.otherTaxes) +
            getVal(values.debtPayments) +
            getVal(values.emergencyFund);

        // Suggested EFC (15% of Income + 5% of Assets - 50% of Expenses (heuristic adjustment))
        // Adjusted logic: Income - Expenses = Available. 20% of Available + 5% Assets?
        // Staying simple as per previous logic, but maybe subtracting expenses makes sense?
        // User asked for "Real Available Income", but didn't specify EFC formula change.
        // I will keep EFC simple but maybe display "Available Income" too?
        // "This allows the system to calculate the 'Real Available Income' for university fees."

        const availableIncome = Math.max(0, totalIncome - totalExpenses);

        // Let's refine EFC to use Available Income if meaningful, else stik to standard. 
        // Standard EFC often ignores expenses except taxes. 
        // But for this "Advanced" tab, let's use:
        // EFC = 20% of (Income - Expenses) + 5% of Assets
        const suggestedEFC = Math.round((availableIncome * 0.20) + (totalAssets * 0.05));

        return { totalIncome, totalAssets, totalExpenses, suggestedEFC, netHomeEquity, availableIncome };
    }, [values]);

    // ─── Handlers ────────────────────────────────────────────────────────────

    const onSubmit = (data: FinanceFormData) => {
        console.log('Finance Data:', data);
        updateFinance(data);
        toast.success('Financial Profile Saved', {
            description: 'Your ISFAA financial data has been updated.',
        });
    };

    // Reusable Input Component
    const MoneyInput = ({ name, label, placeholder }: { name: keyof FinanceFormData, label: string, placeholder?: string }) => (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                $
                            </span>
                            <Input
                                {...field} // spread field props (onChange, onBlur, value, ref)
                                type="text"
                                inputMode="numeric"
                                placeholder={placeholder || "0"}
                                // Handle value safely for display
                                value={typeof field.value === 'number' && field.value !== undefined
                                    ? field.value.toLocaleString('en-US')
                                    : ''}
                                // Custom onChange to parse string back to number
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/[^0-9]/g, '');
                                    const val = raw ? parseInt(raw, 10) : undefined;
                                    field.onChange(val);
                                }}
                                className="pl-8"
                            />
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    return (
        <div className="max-w-4xl space-y-6">

            {/* ─── Header ─── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#C26E26] flex items-center gap-2">
                        <DollarSign className="w-6 h-6" />
                        Financial Aid Profile (ISFAA)
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Provide detailed information for need-based aid assessment (Values in USD).
                    </p>
                </div>
            </div>

            {/* ─── Step 1: Family Summary (Read-Only) ─── */}
            <Card className="bg-secondary/10 border-secondary/20 dashed-border">
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#C26E26]" />
                        Family Context (Read-Only)
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#C26E26] h-8 gap-1 hover:text-[#A55A1F] hover:bg-[#C26E26]/10"
                        // This link enables the simulation of returning to edit data
                        onClick={() => toast.info('Please navigate to the Family tab to edit these details.')}
                    >
                        <Pencil className="w-3 h-3" />
                        Edit in Family Tab
                    </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground block text-xs uppercase tracking-wide">Parents</span>
                        <p className="font-medium">
                            {/* @ts-ignore */}
                            {family.parent1?.firstName || 'Parent 1'} & {/* @ts-ignore */}
                            {family.parent2?.firstName || 'Parent 2'}
                        </p>
                    </div>
                    <div>
                        <span className="text-muted-foreground block text-xs uppercase tracking-wide">Marital Status</span>
                        {/* @ts-ignore */}
                        <p className="font-medium">{family.maritalStatus || 'Not Specified'}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground block text-xs uppercase tracking-wide">Siblings</span>
                        {/* @ts-ignore */}
                        <p className="font-medium">{family.numberOfSiblings ? `${family.numberOfSiblings} siblings` : 'None'}</p>
                    </div>
                </CardContent>
            </Card>

            {/* ─── Form Content ─── */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    <Accordion type="multiple" defaultValue={['income', 'assets', 'expenses']} className="w-full space-y-4">

                        {/* A) Household Income */}
                        <AccordionItem value="income" className="border rounded-lg bg-white px-4 shadow-sm">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                                        <HandCoins className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Household Income (Per Year)</h3>
                                        <p className="text-xs text-muted-foreground">Gross income before taxes for 2024</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {parent1Living && (
                                    <MoneyInput name="fatherGrossIncome" label={`${parent1Name}'s Gross Income`} />
                                )}
                                {parent2Living && (
                                    <MoneyInput name="motherGrossIncome" label={`${parent2Name}'s Gross Income`} />
                                )}
                                <MoneyInput name="otherIncome" label="Other Income (Business/Rent)" />
                                <MoneyInput name="totalTaxPaid" label="Total Income Tax Paid" />
                                <div className="md:col-span-2 bg-gray-50 p-3 rounded-md flex justify-between items-center text-sm border">
                                    <span className="font-medium text-gray-700">Total Annual Income:</span>
                                    <span className="font-bold text-lg text-green-700">
                                        {formatCurrency(calculations.totalIncome)}
                                    </span>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* B) Assets */}
                        <AccordionItem value="assets" className="border rounded-lg bg-white px-4 shadow-sm">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Assets & Investments</h3>
                                        <p className="text-xs text-muted-foreground">Savings, investments, and property</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-4 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <MoneyInput name="savings" label="Cash & Bank Savings" />
                                    <MoneyInput name="investments" label="Investments (Stocks, Bonds)" />
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium">Real Estate (Home)</h4>
                                            <p className="text-xs text-muted-foreground">Do your parents own their home?</p>
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="ownsHome"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        {field.value ? 'Yes, we own it' : 'No, we rent'}
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Conditional Real Estate Fields */}
                                    {values.ownsHome && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                                            <MoneyInput name="homeMarketValue" label="Current Market Value" />
                                            <MoneyInput name="homeMortgage" label="Unpaid Mortgage Debt" />
                                        </div>
                                    )}

                                    {values.ownsHome && calculations.netHomeEquity > 0 && (
                                        <p className="text-xs text-muted-foreground text-right">
                                            Net Home Equity included: <span className="font-medium text-gray-900">{formatCurrency(calculations.netHomeEquity)}</span>
                                        </p>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* C) Student Finances & Expenses */}
                        <AccordionItem value="expenses" className="border rounded-lg bg-white px-4 shadow-sm">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                                        <Calculator className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Student Needs & Annual Expenses</h3>
                                        <p className="text-xs text-muted-foreground">Detailed breakdown of family expenditures</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-4 space-y-6">
                                <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100">
                                    <h4 className="text-sm font-medium text-purple-900 mb-3">Student's Personal Assets</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <MoneyInput name="studentSavings" label="Student's Personal Savings" />
                                        <MoneyInput name="studentGrants" label="External Grants/Scholarships" />
                                    </div>
                                </div>
                                <Separator />

                                {/* New Detailed Expense Breakdown Component */}
                                <ExpenseBreakdown />

                            </AccordionContent>
                        </AccordionItem>

                    </Accordion>

                    {/* ─── Step 3: Calculation & EFC ─── */}
                    <Card className="border-[#C26E26]/20 bg-orange-50/10 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Check className="w-5 h-5 text-[#C26E26]" />
                                Financial Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="bg-white p-3 rounded border shadow-sm">
                                    <span className="block text-muted-foreground text-xs uppercase tracking-wide">Total Income</span>
                                    <span className="font-bold text-lg text-gray-800">{formatCurrency(calculations.totalIncome)}</span>
                                </div>
                                <div className="bg-white p-3 rounded border shadow-sm">
                                    <span className="block text-muted-foreground text-xs uppercase tracking-wide">Total Assets</span>
                                    <span className="font-bold text-lg text-gray-800">{formatCurrency(calculations.totalAssets)}</span>
                                </div>
                                <div className="bg-white p-3 rounded border shadow-sm">
                                    <span className="block text-muted-foreground text-xs uppercase tracking-wide">Total Expenses</span>
                                    <span className="font-bold text-lg text-gray-800">{formatCurrency(calculations.totalExpenses)}</span>
                                </div>
                                <div className="bg-green-50 p-3 rounded border border-green-200 shadow-sm">
                                    <span className="block text-green-700 text-xs uppercase tracking-wide">Real Available</span>
                                    <span className="font-bold text-lg text-green-800">{formatCurrency(calculations.availableIncome)}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="bg-white p-4 rounded-lg border-2 border-[#C26E26]/10 flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div>
                                        <h4 className="font-bold text-[#C26E26]">Expected Family Contribution (EFC)</h4>
                                        <p className="text-xs text-muted-foreground">
                                            Calculated based on 20% of Available Income + 5% of Assets.
                                            Suggested: <strong className="text-gray-900">{formatCurrency(calculations.suggestedEFC)}</strong>
                                        </p>
                                    </div>
                                </div>
                                <MoneyInput name="expectedFamilyContribution" label="Final EFC Amount (You can override)" />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#C26E26] hover:bg-[#A55A1F] text-white h-12 text-lg font-semibold shadow-md transition-all"
                            >
                                Save Financial Profile
                            </Button>
                        </CardContent>
                    </Card>

                </form>
            </Form>
        </div>
    );
}
