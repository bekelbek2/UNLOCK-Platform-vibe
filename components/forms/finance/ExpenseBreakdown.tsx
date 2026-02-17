"use client";

import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, Calculator, TrendingDown, Home, ShoppingCart, Activity, GraduationCap, Receipt } from "lucide-react";
import { useProfileData } from "@/lib/profileStore";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ExpenseBreakdownProps { }

function formatCurrency(value: number) {
    return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    });
}

export function ExpenseBreakdown({ }: ExpenseBreakdownProps) {
    const { control } = useFormContext();
    const { data: profileData } = useProfileData();

    // Calculate sibling count safely
    const siblingCount = profileData.family?.numberOfSiblings
        ? Number(profileData.family.numberOfSiblings)
        : 0;

    // Watch all expense fields for real-time calculation
    const values = useWatch({
        control,
        name: [
            "rentOrMortgage",
            "utilities",
            "foodAndHousehold",
            "clothingAndPersonal",
            "medicalExpenses",
            "transportation",
            "educationFees",
            "booksAndSupplies",
            "insurance",
            "otherTaxes",
            "debtPayments",
            "emergencyFund",
        ],
    });

    const totalExpenses = useMemo(() => {
        return values.reduce((acc: number, val: number | undefined) => acc + (val || 0), 0);
    }, [values]);

    // Reusable MoneyInput Component (Local to avoid circular deps or complex refactoring)
    const MoneyInput = ({
        name,
        label,
        placeholder,
    }: {
        name: string;
        label: string;
        placeholder?: string;
    }) => (
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
                                {...field}
                                type="text"
                                inputMode="numeric"
                                placeholder={placeholder || "0"}
                                value={
                                    typeof field.value === "number" && field.value !== undefined
                                        ? field.value.toLocaleString("en-US")
                                        : ""
                                }
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/[^0-9]/g, "");
                                    const val = raw ? parseInt(raw, 10) : undefined;
                                    field.onChange(val);

                                    // Zero Rent Warning logic
                                    if (name === "rentOrMortgage" && val === 0) {
                                        // We could toast here, but it might be annoying on every keystroke. 
                                        // Better to rely on validation or onBlur. 
                                        // For now, let's just let the user type.
                                    }
                                }}
                                onBlur={() => {
                                    if (name === "rentOrMortgage" && field.value === 0) {
                                        toast.warning("Confirm Housing Cost", {
                                            description: "You entered 0 for Rent/Mortgage. Please confirm if housing is provided free of charge."
                                        });
                                    }
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
        <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-6">
                <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Annual Family Expenses
                </h3>
                <p className="text-sm text-purple-700 mt-1">
                    Please provide estimated annual amounts for 2025. Enter 0 if not applicable.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                {/* 1. Housing */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2 border-b pb-2">
                        <Home className="w-4 h-4 text-muted-foreground" /> Housing
                    </h4>
                    <MoneyInput name="rentOrMortgage" label="Annual Rent or Mortgage" />
                    <MoneyInput name="utilities" label="Utilities (gas, electric, water, internet)" />
                </div>

                {/* 2. Sustenance */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2 border-b pb-2">
                        <ShoppingCart className="w-4 h-4 text-muted-foreground" /> Sustenance
                    </h4>
                    <MoneyInput name="foodAndHousehold" label="Food & Household Supplies" />
                    <MoneyInput name="clothingAndPersonal" label="Clothing & Personal" />
                </div>

                {/* 3. Health & Transport */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2 border-b pb-2">
                        <Activity className="w-4 h-4 text-muted-foreground" /> Health & Transport
                    </h4>
                    <MoneyInput name="medicalExpenses" label="Medical/Dental (Out of pocket)" />
                    <MoneyInput name="transportation" label="Transportation (Fuel, Maintenance, Fare)" />
                </div>

                {/* 4. Education */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2 border-b pb-2">
                        <GraduationCap className="w-4 h-4 text-muted-foreground" /> Education
                    </h4>

                    {siblingCount > 0 && (
                        <Alert className="py-2 bg-blue-50 text-blue-800 border-blue-100 mb-2">
                            <Info className="w-4 h-4" />
                            <AlertTitle>Family Context</AlertTitle>
                            <AlertDescription className="text-xs">
                                You listed <strong>{siblingCount} siblings</strong> in the Family tab. Please include their tuition fees here.
                            </AlertDescription>
                        </Alert>
                    )}

                    <MoneyInput name="educationFees" label="Tuition & Fees (All Children)" />
                    <MoneyInput name="booksAndSupplies" label="Books & School Supplies" />
                </div>

                {/* 5. Other */}
                <div className="col-span-1 md:col-span-2 space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2 border-b pb-2">
                        <Receipt className="w-4 h-4 text-muted-foreground" /> Other Expenses
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MoneyInput name="insurance" label="Insurance Premiums (Home, Car, Life)" />
                        <MoneyInput name="otherTaxes" label="Taxes (Property, etc. not deducted from income)" />
                        <MoneyInput name="debtPayments" label="Debt/Loan Repayments" />
                        <MoneyInput name="emergencyFund" label="Emergency/Unexpected Expenses" />
                    </div>
                </div>
            </div>

            <Separator className="my-6" />

            {/* Total Expenses Calculation Bar */}
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 rounded-full">
                        <TrendingDown className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Total Annual Expenses</h3>
                        <p className="text-slate-400 text-sm">Sum of all categories above</p>
                    </div>
                </div>
                <div className="text-3xl font-mono font-bold text-red-400">
                    {formatCurrency(totalExpenses)}
                </div>
            </div>
        </div>
    );
}
