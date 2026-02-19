'use client';

import { useMemo, useEffect, memo } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, TrendingUp, TrendingDown, Check } from 'lucide-react';
import { toast } from 'sonner';

import { useProfileData, IncomeItem, AssetItem, OtherExpenseItem, DebtItem } from '@/lib/profileStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { DynamicFinanceSection } from '@/components/forms/finance/DynamicFinanceSection';

// ─── 1. Zod Schema ───────────────────────────────────────────────────────────

const incomeItemSchema = z.object({
    id: z.string(),
    source: z.string().min(1, "Source is required"),
    amount: z.number().min(0),
    taxPaid: z.number().min(0).optional(),
    isTaxable: z.boolean().optional(),
    type: z.string().min(1),
});

const assetItemSchema = z.object({
    id: z.string(),
    source: z.string().min(1, "Source is required"),
    value: z.number().min(0),
    type: z.string().min(1),
});

const otherExpenseItemSchema = z.object({
    id: z.string(),
    source: z.string().min(1, "Description is required"),
    amount: z.number().min(0),
});

const debtItemSchema = z.object({
    id: z.string(),
    source: z.string().min(1, "Description is required"),
    amount: z.number().min(0),
});

const financeSchema = z.object({
    // Dynamic Arrays
    incomes: z.array(incomeItemSchema),
    assets: z.array(assetItemSchema),
    otherExpenses: z.array(otherExpenseItemSchema),
    debts: z.array(debtItemSchema),

    // Static Expenses (Detailed Breakdown)
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

    // Calculated Need
    expectedFamilyContribution: z.number().min(0, 'Amount must be positive').optional(),
});

type FinanceFormData = z.infer<typeof financeSchema>;

// ─── Sub-Components ─────────────────────────────────────────────────────────

// Memoized MoneyInput to prevent unnecessary re-renders
const MoneyInput = memo(({ name, label, control, placeholder }: { name: keyof FinanceFormData, label: string, control: any, placeholder?: string }) => (
    <FormField
        control={control}
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
                            // @ts-ignore
                            {...field}
                            type="text"
                            inputMode="numeric"
                            placeholder={placeholder || "0"}
                            value={typeof field.value === 'number' && field.value !== undefined
                                ? field.value.toLocaleString('en-US')
                                : ''}
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
));
MoneyInput.displayName = 'MoneyInput';

// Separate Summary Component to isolate re-renders from calculations
function FinancialSummary({ control }: { control: any }) {
    const values = useWatch({ control });

    const calculations = useMemo(() => {
        const getVal = (v: number | undefined) => v || 0;

        const totalIncomeGross = (values.incomes || []).reduce((sum: number, item: IncomeItem) => sum + (item.amount || 0), 0);
        const totalTaxPaid = (values.incomes || []).reduce((sum: number, item: IncomeItem) => sum + (item.taxPaid || 0), 0);

        const totalAssets = (values.assets || []).reduce((sum: number, item: AssetItem) => sum + (item.value || 0), 0);

        // Static Expenses
        const staticExpensesTotal =
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


        const otherExpensesTotal = (values.otherExpenses || []).reduce((sum: number, item: OtherExpenseItem) => sum + (item.amount || 0), 0);
        const totalDebts = (values.debts || []).reduce((sum: number, item: DebtItem) => sum + (item.amount || 0), 0);

        // Tax is now considered an expense
        const totalExpenses = staticExpensesTotal + otherExpensesTotal + totalDebts + totalTaxPaid;

        // New Layout Vars
        const netIncome = totalIncomeGross - totalTaxPaid;
        const livingExpenses = staticExpensesTotal + otherExpensesTotal;

        // Available Income logic (remains same for EFC calc, or should I use net?)
        // EFC formula usually uses AGI or Net. Sticking to existing logic for consistency unless asked.
        const availableIncome = Math.max(0, totalIncomeGross - totalExpenses);

        // EFC: 20% of (Available Income) + 5% of Assets
        const suggestedEFC = Math.round((availableIncome * 0.20) + (totalAssets * 0.05));

        return {
            totalIncome: totalIncomeGross,
            netIncome,
            totalTaxPaid,
            totalAssets,
            totalDebts,
            livingExpenses,
            totalExpenses,
            suggestedEFC,
            availableIncome
        };
    }, [values]);

    return (
        <Card className="bg-slate-50 border-slate-200 mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Financial Summary
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="p-4 bg-white rounded-lg border shadow-sm">
                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Net Income</p>
                        <p className="text-2xl font-bold text-teal-600">{formatCurrency(calculations.netIncome)}</p>
                        <p className="text-xs text-muted-foreground mt-1">After Tax</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border shadow-sm">
                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Assets</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(calculations.totalAssets)}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border shadow-sm">
                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Debts</p>
                        <p className="text-2xl font-bold text-orange-600">{formatCurrency(calculations.totalDebts)}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border shadow-sm">
                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Expenses</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(calculations.livingExpenses)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Living Expenses</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border shadow-sm">
                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Calculated Need</p>
                        <p className="text-2xl font-bold text-purple-600">{formatCurrency(calculations.suggestedEFC)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Estimated Family Contribution</p>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-orange-50/50 rounded-lg border border-orange-100">
                    <MoneyInput
                        control={control}
                        name="expectedFamilyContribution"
                        label="Final Expected Family Contribution (You can override)"
                        placeholder={calculations.suggestedEFC.toString()}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

// Top Summary separate for layout reasons
function FinancialHeaderSummary({ control }: { control: any }) {
    const values = useWatch({ control });

    const calculations = useMemo(() => {
        const getVal = (v: number | undefined) => v || 0;

        const totalIncomeGross = (values.incomes || []).reduce((sum: number, item: IncomeItem) => sum + (item.amount || 0), 0);

        const staticExpensesTotal =
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

        const otherExpensesTotal = (values.otherExpenses || []).reduce((sum: number, item: OtherExpenseItem) => sum + (item.amount || 0), 0);
        const totalDebts = (values.debts || []).reduce((sum: number, item: DebtItem) => sum + (item.amount || 0), 0);
        const totalTaxPaid = (values.incomes || []).reduce((sum: number, item: IncomeItem) => sum + (item.taxPaid || 0), 0);

        const totalExpenses = staticExpensesTotal + otherExpensesTotal + totalDebts + totalTaxPaid;

        return { totalIncome: totalIncomeGross, totalExpenses };
    }, [values]);

    return (
        <div className="flex gap-2">
            <div className="bg-teal-900 text-white p-3 rounded-lg shadow-sm flex items-center gap-3 min-w-[160px]">
                <div className="p-2 bg-white/10 rounded-full">
                    <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs text-teal-100 font-medium uppercase tracking-wider">Total Income</p>
                    <p className="text-xl font-bold">{formatCurrency(calculations.totalIncome)}</p>
                </div>
            </div>
            <div className="bg-slate-900 text-white p-3 rounded-lg shadow-sm flex items-center gap-3 min-w-[160px]">
                <div className="p-2 bg-white/10 rounded-full">
                    <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs text-slate-300 font-medium uppercase tracking-wider">Total Expenses</p>
                    <p className="text-xl font-bold">{formatCurrency(calculations.totalExpenses)}</p>
                </div>
            </div>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────

export default function FinanceTab() {
    const { data: profileData, updateFinance } = useProfileData();

    // Initialize Form
    const form = useForm<FinanceFormData>({
        resolver: zodResolver(financeSchema),
        defaultValues: {
            incomes: (profileData.finance?.incomes as IncomeItem[]) || [],
            assets: (profileData.finance?.assets as AssetItem[]) || [],
            otherExpenses: (profileData.finance?.otherExpenses as OtherExpenseItem[]) || [],
            debts: (profileData.finance?.debts as DebtItem[]) || [],

            rentOrMortgage: profileData.finance?.rentOrMortgage as number | undefined,
            utilities: profileData.finance?.utilities as number | undefined,
            foodAndHousehold: profileData.finance?.foodAndHousehold as number | undefined,
            clothingAndPersonal: profileData.finance?.clothingAndPersonal as number | undefined,
            medicalExpenses: profileData.finance?.medicalExpenses as number | undefined,
            transportation: profileData.finance?.transportation as number | undefined,
            educationFees: profileData.finance?.educationFees as number | undefined,
            booksAndSupplies: profileData.finance?.booksAndSupplies as number | undefined,
            insurance: profileData.finance?.insurance as number | undefined,
            otherTaxes: profileData.finance?.otherTaxes as number | undefined,
            debtPayments: profileData.finance?.debtPayments as number | undefined,
            emergencyFund: profileData.finance?.emergencyFund as number | undefined,

            expectedFamilyContribution: profileData.finance?.expectedFamilyContribution as number | undefined,
        },
    });

    const { fields: incomeFields, append: appendIncome, remove: removeIncome, update: updateIncome } = useFieldArray({
        control: form.control,
        name: "incomes",
    });

    const { fields: assetFields, append: appendAsset, remove: removeAsset, update: updateAsset } = useFieldArray({
        control: form.control,
        name: "assets",
    });

    const { fields: otherExpenseFields, append: appendOtherExpense, remove: removeOtherExpense, update: updateOtherExpense } = useFieldArray({
        control: form.control,
        name: "otherExpenses",
    });

    const { fields: debtFields, append: appendDebt, remove: removeDebt } = useFieldArray({
        control: form.control,
        name: "debts",
    });

    // Granular watchers to prevent global re-render on static input change
    const incomes = useWatch({ control: form.control, name: 'incomes' });
    const assets = useWatch({ control: form.control, name: 'assets' });
    const debts = useWatch({ control: form.control, name: 'debts' });
    const otherExpenses = useWatch({ control: form.control, name: 'otherExpenses' });

    // Sync form with store updates
    useEffect(() => {
        if (profileData.finance) {
            // Logic if needed
        }
    }, [profileData.finance]);


    // ─── Handlers ────────────────────────────────────────────────────────────

    const onSubmit = (data: FinanceFormData) => {
        console.log('Finance Data:', data);
        updateFinance(data);
        toast.success('Financial Profile Saved', {
            description: 'Your ISFAA financial data has been updated.',
        });
    };

    return (
        <div className="max-w-4xl space-y-8">

            {/* ─── Header ─── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#C26E26] flex items-center gap-2">
                        <DollarSign className="w-6 h-6" />
                        Financial Aid Profile (ISFAA)
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Manage your annual income, assets, and expenses dynamically.
                    </p>
                </div>
                {/* Header Summary Component */}
                <FinancialHeaderSummary control={form.control} />
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <Accordion type="multiple" defaultValue={['income', 'assets', 'debts', 'expenses']} className="w-full space-y-6">

                        {/* A) Dynamic Income */}
                        <AccordionItem value="income" className="border-none">
                            <DynamicFinanceSection
                                title="Annual Income"
                                description="Add all sources of family income (before tax)."
                                items={(incomes || []) as IncomeItem[]}
                                onAdd={() => appendIncome({ id: Date.now().toString(), source: '', amount: 0, taxPaid: 0, isTaxable: false, type: 'salary' })}
                                onRemove={(id) => {
                                    const index = (incomes || []).findIndex((i: IncomeItem) => i.id === id);
                                    if (index !== -1) removeIncome(index);
                                }}
                                onUpdate={(id, field, value) => {
                                    const index = (incomes || []).findIndex((i: IncomeItem) => i.id === id);
                                    if (index !== -1) {
                                        // @ts-ignore
                                        form.setValue(`incomes.${index}.${field}`, value, {
                                            shouldDirty: true,
                                            shouldTouch: true,
                                            shouldValidate: true
                                        });
                                    }
                                }}
                                type="income"
                                icon={<TrendingUp className="w-5 h-5" />}
                            />
                        </AccordionItem>

                        {/* B) Dynamic Assets */}
                        <AccordionItem value="assets" className="border-none">
                            <DynamicFinanceSection
                                title="Assets & Savings"
                                description="List all family assets including savings, investments, and property."
                                items={(assets || []) as AssetItem[]}
                                onAdd={() => appendAsset({ id: Date.now().toString(), source: '', value: 0, type: 'asset' })}
                                onRemove={(id) => {
                                    const index = (assets || []).findIndex((i: AssetItem) => i.id === id);
                                    if (index !== -1) removeAsset(index);
                                }}
                                onUpdate={(id, field, value) => {
                                    const index = (assets || []).findIndex((i: AssetItem) => i.id === id);
                                    if (index !== -1) {
                                        // @ts-ignore
                                        form.setValue(`assets.${index}.${field}`, value, {
                                            shouldDirty: true,
                                            shouldTouch: true,
                                            shouldValidate: true
                                        });
                                    }
                                }}
                                type="asset"
                                icon={<DollarSign className="w-5 h-5" />}
                            />
                        </AccordionItem>

                        {/* C) Debts & Liabilities */}
                        <AccordionItem value="debts" className="border-none">
                            <DynamicFinanceSection
                                title="Debts & Liabilities"
                                description="List any loans, credit card debts, or other liabilities. These will be treated as annual expenses."
                                items={(debts || []) as DebtItem[]}
                                onAdd={() => appendDebt({ id: Date.now().toString(), source: '', amount: 0 })}
                                onRemove={(id) => {
                                    const index = (debts || []).findIndex((i: DebtItem) => i.id === id);
                                    if (index !== -1) removeDebt(index);
                                }}
                                onUpdate={(id, field, value) => {
                                    const index = (debts || []).findIndex((i: DebtItem) => i.id === id);
                                    if (index !== -1) {
                                        // @ts-ignore
                                        form.setValue(`debts.${index}.${field}`, value, {
                                            shouldDirty: true,
                                            shouldTouch: true,
                                            shouldValidate: true
                                        });
                                    }
                                }}
                                type="expense"
                                icon={<TrendingDown className="w-5 h-5" />}
                            />
                        </AccordionItem>

                        {/* C) Expenses (Hybrid) */}
                        <AccordionItem value="expenses" className="border rounded-lg bg-white px-4 shadow-sm">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                                        <TrendingDown className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Annual Expenses</h3>
                                        <p className="text-xs text-muted-foreground">Detailed breakdown of standard and other expenses</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-4 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <MoneyInput control={form.control} name="rentOrMortgage" label="Rent / Mortgage" />
                                    <MoneyInput control={form.control} name="utilities" label="Utilities" />
                                    <MoneyInput control={form.control} name="foodAndHousehold" label="Food & Household" />
                                    <MoneyInput control={form.control} name="clothingAndPersonal" label="Clothing/Personal" />
                                    <MoneyInput control={form.control} name="medicalExpenses" label="Medical Expenses" />
                                    <MoneyInput control={form.control} name="transportation" label="Transportation" />
                                    <MoneyInput control={form.control} name="educationFees" label="Education Fees (Siblings)" />
                                    <MoneyInput control={form.control} name="booksAndSupplies" label="Books & Supplies" />
                                    <MoneyInput control={form.control} name="insurance" label="Insurance" />
                                    <MoneyInput control={form.control} name="otherTaxes" label="Other Taxes" />
                                    <MoneyInput control={form.control} name="debtPayments" label="Debt Payments" />
                                    <MoneyInput control={form.control} name="emergencyFund" label="Emergency Fund Contribution" />
                                </div>

                                <Separator className="my-4" />

                                {/* Dynamic "Other" Expenses */}
                                <DynamicFinanceSection
                                    title="Other Expenses"
                                    description="Add any other specific significant expenses (e.g. Elderly Care)."
                                    items={(otherExpenses || []) as OtherExpenseItem[]}
                                    onAdd={() => appendOtherExpense({ id: Date.now().toString(), source: '', amount: 0 })}
                                    onRemove={(id) => {
                                        const index = (otherExpenses || []).findIndex((i: OtherExpenseItem) => i.id === id);
                                        if (index !== -1) removeOtherExpense(index);
                                    }}
                                    onUpdate={(id, field, value) => {
                                        const index = (otherExpenses || []).findIndex((i: OtherExpenseItem) => i.id === id);
                                        if (index !== -1) {
                                            // @ts-ignore
                                            form.setValue(`otherExpenses.${index}.${field}`, value, {
                                                shouldDirty: true,
                                                shouldTouch: true,
                                                shouldValidate: true
                                            });
                                        }
                                    }}
                                    type="expense"
                                    icon={<TrendingDown className="w-5 h-5" />}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* ─── Summary Section (Bottom) ─── */}
                    <FinancialSummary control={form.control} />

                    <div className="flex justify-end pt-4 border-t">
                        <Button type="submit" size="lg" className="px-8 font-semibold bg-[#C26E26] hover:bg-[#A65B1E] text-white">
                            <Check className="w-5 h-5 mr-2" />
                            Save Financial Profile
                        </Button>
                    </div>

                </form>
            </Form>

        </div>
    );
}
