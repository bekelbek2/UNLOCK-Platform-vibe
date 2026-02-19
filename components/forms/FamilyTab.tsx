'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Trash2, Plus, User } from 'lucide-react';

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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    familyFormSchema,
    type FamilyFormData,
    MARITAL_STATUS_OPTIONS,
    RESIDENCE_OPTIONS,
    RELATIONSHIP_OPTIONS,
    EDUCATION_LEVELS,
} from '@/lib/schemas/family-form';
import { useProfileData } from '@/lib/profileStore';


export default function FamilyTab() {
    const { data, updateFamily } = useProfileData();

    const form = useForm<FamilyFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(familyFormSchema) as any,
        defaultValues: {
            maritalStatus: '',
            permanentResidence: '',
            hasChildren: '',
            numberOfChildren: 0,
            parents: [],
            numberOfSiblings: 0,
            siblings: [],
        },
    });

    const { fields: parentFields, append: appendParent, remove: removeParent, replace: replaceParents } = useFieldArray({
        control: form.control,
        name: 'parents',
    });

    const { fields: siblingFields, replace: replaceSiblings } = useFieldArray({
        control: form.control,
        name: 'siblings',
    });

    const watchHasChildren = form.watch('hasChildren');
    const watchNumberOfSiblings = form.watch('numberOfSiblings');
    const parents = form.watch('parents');

    // Sync from Store
    useEffect(() => {
        if (data.family && Object.keys(data.family).length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const familyData = data.family as any;

            // Handle parents migration/init
            let currentParents = familyData.parents || [];

            // If empty, initialize with 2 empty slots as per requirement
            if (currentParents.length === 0) {
                const emptyParent = {
                    relationship: '',
                    age: 0,
                    firstName: '',
                    lastName: '',
                    email: '',
                    isLiving: 'yes',
                    educationLevel: '',
                    occupation: '',
                    employer: '',
                };
                currentParents = [
                    { ...emptyParent, id: 'init-1' },
                    { ...emptyParent, id: 'init-2' }
                ];
            }

            form.reset({
                maritalStatus: familyData.maritalStatus || '',
                permanentResidence: familyData.permanentResidence || '',
                hasChildren: familyData.hasChildren || '',
                numberOfChildren: familyData.numberOfChildren || undefined,
                parents: currentParents,
                numberOfSiblings: familyData.numberOfSiblings || 0,
                siblings: familyData.siblings || [],
            });
        }
    }, [data.family, form]);

    // Dynamically update siblings array
    useEffect(() => {
        const numSiblings = Number(watchNumberOfSiblings) || 0;
        const currentSiblings = form.getValues('siblings') || [];

        if (numSiblings !== currentSiblings.length) {
            const newSiblings = [];
            for (let i = 0; i < numSiblings; i++) {
                newSiblings.push(currentSiblings[i] || { fullName: '', age: 0 });
            }
            replaceSiblings(newSiblings);
        }
    }, [watchNumberOfSiblings, replaceSiblings, form]);


    const onSubmit = async (data: FamilyFormData) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateFamily(data as any);
        console.log('Family form submitted:', data);
        toast.success('Family details saved.', {
            description: 'Your family information has been updated successfully.',
        });
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
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                            value={field.value}
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
                                                onChange={(e) => {
                                                    const val = e.target.valueAsNumber;
                                                    field.onChange(isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                </div>

                {/* Section 2: Parents & Guardians */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Parents & Guardians
                        </h3>
                        <span className="text-sm text-gray-500">
                            {parentFields.length}/4 Added
                        </span>
                    </div>

                    <div className="space-y-4">
                        <Accordion type="multiple" defaultValue={['item-0', 'item-1']} className="w-full space-y-4">
                            {parentFields.map((field, index) => {
                                const currentParent = parents[index];
                                const label = currentParent?.relationship
                                    ? `${currentParent.relationship}: ${currentParent.firstName || ''} ${currentParent.lastName || ''}`
                                    : `New Parent ${index + 1}`;

                                return (
                                    <AccordionItem
                                        key={field.id}
                                        value={`item-${index}`}
                                        className="border rounded-lg px-4 bg-gray-50"
                                    >
                                        <AccordionTrigger className="hover:no-underline py-4">
                                            <div className="flex items-center gap-2 font-medium">
                                                <User className="h-4 w-4 text-[#C26E26]" />
                                                {label}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-4 pb-6 px-1">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Row 1: Relationship & Age */}
                                                <FormField
                                                    control={form.control}
                                                    name={`parents.${index}.relationship`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Relationship <span className="text-red-500">*</span></FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="focus:ring-[#C26E26]">
                                                                        <SelectValue placeholder="Select..." />
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
                                                    name={`parents.${index}.age`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Age <span className="text-red-500">*</span></FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Row 2: Names */}
                                                <FormField
                                                    control={form.control}
                                                    name={`parents.${index}.firstName`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Enter first name" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`parents.${index}.lastName`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Enter last name" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Row 3: Email & Living Status */}
                                                <FormField
                                                    control={form.control}
                                                    name={`parents.${index}.email`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Email</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Enter email address" {...field} value={field.value || ''} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`parents.${index}.isLiving`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Living Status <span className="text-red-500">*</span></FormLabel>
                                                            <FormControl>
                                                                <RadioGroup
                                                                    onValueChange={field.onChange}
                                                                    value={field.value}
                                                                    className="flex gap-6 pt-2"
                                                                >
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem value="yes" id={`living-yes-${index}`} />
                                                                        <Label htmlFor={`living-yes-${index}`}>Living</Label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem value="no" id={`living-no-${index}`} />
                                                                        <Label htmlFor={`living-no-${index}`}>Deceased</Label>
                                                                    </div>
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Row 4: Education, Occupation, Employer */}
                                                <FormField
                                                    control={form.control}
                                                    name={`parents.${index}.educationLevel`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Education Level <span className="text-red-500">*</span></FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select level" />
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
                                                <FormField
                                                    control={form.control}
                                                    name={`parents.${index}.occupation`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Occupation <span className="text-red-500">*</span></FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Job Title" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="md:col-span-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`parents.${index}.employer`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Employer</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Employer Name" {...field} value={field.value || ''} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                {/* Remove Button */}
                                                {parentFields.length > 1 && (
                                                    <div className="md:col-span-2 flex justify-end pt-4 border-t border-gray-200 mt-2">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => removeParent(index)}
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Remove Parent
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>

                        {parentFields.length < 4 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => appendParent({
                                    relationship: '',
                                    age: 0,
                                    firstName: '',
                                    lastName: '',
                                    email: '',
                                    isLiving: 'yes',
                                    educationLevel: '',
                                    occupation: '',
                                    employer: '',
                                })}
                                className="w-full mt-4 border-dashed border-2 py-6 text-muted-foreground hover:text-[#C26E26] hover:border-[#C26E26]"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Parent / Guardian
                            </Button>
                        )}
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

                    {siblingFields.length > 0 && (
                        <div className="space-y-4">
                            {siblingFields.map((field, index) => (
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
                                                            onChange={(e) => {
                                                                const val = e.target.valueAsNumber;
                                                                field.onChange(isNaN(val) ? undefined : val);
                                                            }}
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


