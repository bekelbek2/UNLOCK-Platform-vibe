'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PhoneInput } from '@/components/ui/phone-input';
import {
    familyFormSchema,
    type FamilyFormData,
    MARITAL_STATUS_OPTIONS,
    RESIDENCE_OPTIONS,
    RELATIONSHIP_OPTIONS,
    EDUCATION_LEVELS,
} from '@/lib/schemas/family-form';

export default function FamilyTab() {
    const form = useForm<FamilyFormData>({
        resolver: zodResolver(familyFormSchema),
        defaultValues: {
            maritalStatus: '',
            permanentResidence: '',
            hasChildren: '',
            numberOfChildren: undefined,
            parent1: {
                relationship: '',
                isLiving: '',
                firstName: '',
                lastName: '',
                phoneNumber: '+1',
                occupation: '',
                educationLevel: '',
            },
            parent2: {
                relationship: '',
                isLiving: '',
                firstName: '',
                lastName: '',
                phoneNumber: '+1',
                occupation: '',
                educationLevel: '',
            },
            numberOfSiblings: 0,
            siblings: [],
        },
    });

    const { fields, replace } = useFieldArray({
        control: form.control,
        name: 'siblings',
    });

    const watchHasChildren = form.watch('hasChildren');
    const watchNumberOfSiblings = form.watch('numberOfSiblings');

    // Dynamically update siblings array when number changes
    useEffect(() => {
        const numSiblings = Number(watchNumberOfSiblings) || 0;
        const currentSiblings = form.getValues('siblings');

        if (numSiblings !== currentSiblings.length) {
            const newSiblings = [];
            for (let i = 0; i < numSiblings; i++) {
                newSiblings.push(currentSiblings[i] || { fullName: '', age: 0 });
            }
            replace(newSiblings);
        }
    }, [watchNumberOfSiblings, replace, form]);

    const onSubmit = async (data: FamilyFormData) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('Family form submitted:', data);
        toast.success('Family details saved.', {
            description: 'Your family information has been updated successfully.',
        });
    };

    // Parent form section component
    const ParentSection = ({ parentNumber }: { parentNumber: 1 | 2 }) => {
        const parentKey = `parent${parentNumber}` as 'parent1' | 'parent2';

        return (
            <div className="space-y-4">
                <h4 className="font-medium text-gray-900 text-base">
                    Parent/Guardian {parentNumber}
                </h4>

                <FormField
                    control={form.control}
                    name={`${parentKey}.relationship`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Relationship <span className="text-red-500">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="focus:ring-[#C26E26]">
                                        <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {RELATIONSHIP_OPTIONS.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name={`${parentKey}.isLiving`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Is this parent living? <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex gap-6"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yes" id={`${parentKey}-living-yes`} />
                                        <Label htmlFor={`${parentKey}-living-yes`}>Yes</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id={`${parentKey}-living-no`} />
                                        <Label htmlFor={`${parentKey}-living-no`}>No</Label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name={`${parentKey}.firstName`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter first name"
                                        className="focus-visible:ring-[#C26E26]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`${parentKey}.lastName`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter last name"
                                        className="focus-visible:ring-[#C26E26]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name={`${parentKey}.phoneNumber`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <PhoneInput value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name={`${parentKey}.occupation`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Occupation (former if retired) <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter occupation"
                                    className="focus-visible:ring-[#C26E26]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name={`${parentKey}.educationLevel`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Highest Education Level <span className="text-red-500">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="focus:ring-[#C26E26]">
                                        <SelectValue placeholder="Select education level" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {EDUCATION_LEVELS.map((level) => (
                                        <SelectItem key={level} value={level}>{level}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        );
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Section 1: Household Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                        Household Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="maritalStatus"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Parents&apos; Marital Status <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="focus:ring-[#C26E26]">
                                                <SelectValue placeholder="Select marital status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {MARITAL_STATUS_OPTIONS.map((status) => (
                                                <SelectItem key={status} value={status}>{status}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="permanentResidence"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Permanent Residence <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="focus:ring-[#C26E26]">
                                                <SelectValue placeholder="Select residence" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {RESIDENCE_OPTIONS.map((opt) => (
                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="hasChildren"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Do you have children?</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-6"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="yes" id="children-yes" />
                                                <Label htmlFor="children-yes">Yes</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="no" id="children-no" />
                                                <Label htmlFor="children-no">No</Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {watchHasChildren === 'yes' && (
                            <FormField
                                control={form.control}
                                name="numberOfChildren"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>How many children? <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                placeholder="Enter number"
                                                className="focus-visible:ring-[#C26E26] w-32"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                </div>

                {/* Section 2: Parent/Guardian Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                        Parent/Guardian Information
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                            <ParentSection parentNumber={1} />
                        </div>
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                            <ParentSection parentNumber={2} />
                        </div>
                    </div>
                </div>

                {/* Section 3: Siblings */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                        Siblings
                    </h3>

                    <FormField
                        control={form.control}
                        name="numberOfSiblings"
                        render={({ field }) => (
                            <FormItem className="mb-6">
                                <FormLabel>How many siblings do you have? <span className="text-red-500">*</span></FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={String(field.value)}
                                >
                                    <FormControl>
                                        <SelectTrigger className="focus:ring-[#C26E26] w-40">
                                            <SelectValue placeholder="Select number" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                            <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {fields.length > 0 && (
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-medium text-gray-900">Sibling {index + 1}</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`siblings.${index}.fullName`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter full name"
                                                            className="focus-visible:ring-[#C26E26]"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`siblings.${index}.age`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Age <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            placeholder="Enter age"
                                                            className="focus-visible:ring-[#C26E26] w-24"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="bg-[#C26E26] hover:bg-[#A85A1E] text-white px-8 py-2"
                    >
                        {form.formState.isSubmitting ? 'Saving...' : 'Save Family Details'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
