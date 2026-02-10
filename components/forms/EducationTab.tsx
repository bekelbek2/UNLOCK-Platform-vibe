'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
    educationFormSchema,
    type EducationFormData,
    MONTHS,
    YEARS,
    GRADUATION_YEARS,
    SCHOOL_TYPES,
    PROGRESSION_OPTIONS,
    GPA_SCALES,
    STUDENT_STATUS_OPTIONS,
    DEGREES,
    CAREERS,
} from '@/lib/schemas/education-form';

const COUNTRIES = [
    'United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France',
    'Australia', 'Japan', 'China', 'India', 'Brazil', 'South Korea', 'Nigeria', 'Kenya'
];

export default function EducationTab() {
    const form = useForm<EducationFormData>({
        resolver: zodResolver(educationFormSchema),
        defaultValues: {
            highSchoolName: '',
            street: '',
            city: '',
            stateProvince: '',
            country: '',
            zipCode: '',
            schoolType: '',
            entryMonth: '',
            entryYear: '',
            isBoardingSchool: '',
            livesOnCampus: '',
            willGraduate: '',
            exitMonth: '',
            exitYear: '',
            graduationMonth: '',
            graduationYear: '',
            progressionChanges: [],
            progressionDetails: '',
            classSize: 0,
            classRank: '',
            gpaScale: '',
            cumulativeGpa: 0,
            gpaType: '',
            studentStatus: '',
            highestDegree: '',
            careerInterest: '',
            otherCareer: '',
        },
    });

    const watchWillGraduate = form.watch('willGraduate');
    const watchProgressionChanges = form.watch('progressionChanges');
    const watchCareerInterest = form.watch('careerInterest');

    // Handle progression changes mutual exclusivity
    const handleProgressionChange = (option: string, checked: boolean) => {
        const current = form.getValues('progressionChanges');

        if (option === 'No Change') {
            if (checked) {
                form.setValue('progressionChanges', ['No Change']);
            } else {
                form.setValue('progressionChanges', []);
            }
        } else {
            if (checked) {
                const filtered = current.filter(c => c !== 'No Change');
                form.setValue('progressionChanges', [...filtered, option]);
            } else {
                form.setValue('progressionChanges', current.filter(c => c !== option));
            }
        }
    };



    const showProgressionDetails = watchProgressionChanges.some(c => c !== 'No Change' && c !== '');

    const onSubmit = async (data: EducationFormData) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('Education form submitted:', data);
        toast.success('Education details saved.', {
            description: 'Your education information has been updated successfully.',
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Section 1: Current/Most Recent High School */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                        Current/Most Recent High School
                    </h3>

                    <div className="space-y-6">
                        {/* High School Name */}
                        <FormField
                            control={form.control}
                            name="highSchoolName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>High School Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter high school name"
                                            className="focus-visible:ring-[#C26E26]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Address Section */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">Address</h4>
                            <FormField
                                control={form.control}
                                name="street"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Street <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter street address"
                                                className="focus-visible:ring-[#C26E26]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter city"
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
                                    name="stateProvince"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State/Province <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter state/province"
                                                    className="focus-visible:ring-[#C26E26]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country <span className="text-red-500">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="focus:ring-[#C26E26]">
                                                        <SelectValue placeholder="Select country" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {COUNTRIES.map((c) => (
                                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="zipCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Zip Code</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter zip code"
                                                    className="focus-visible:ring-[#C26E26]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* School Type */}
                        <FormField
                            control={form.control}
                            name="schoolType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>School Type <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="focus:ring-[#C26E26] w-64">
                                                <SelectValue placeholder="Select school type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {SCHOOL_TYPES.map((type) => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Date of Entry */}
                        <div>
                            <Label className="text-sm font-medium">Date of Entry <span className="text-red-500">*</span></Label>
                            <div className="grid grid-cols-2 gap-4 mt-2 max-w-sm">
                                <FormField
                                    control={form.control}
                                    name="entryMonth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="focus:ring-[#C26E26]">
                                                        <SelectValue placeholder="Month" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {MONTHS.map((m) => (
                                                        <SelectItem key={m} value={m}>{m}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="entryYear"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="focus:ring-[#C26E26]">
                                                        <SelectValue placeholder="Year" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {YEARS.map((y) => (
                                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Boarding School */}
                        <FormField
                            control={form.control}
                            name="isBoardingSchool"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Is this a boarding school? <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-6"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="yes" id="boarding-yes" className="border-[#C26E26] text-[#C26E26]" />
                                                <Label htmlFor="boarding-yes">Yes</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="no" id="boarding-no" className="border-[#C26E26] text-[#C26E26]" />
                                                <Label htmlFor="boarding-no">No</Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Lives on Campus */}
                        <FormField
                            control={form.control}
                            name="livesOnCampus"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Do you live on campus? <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-6"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="yes" id="campus-yes" className="border-[#C26E26] text-[#C26E26]" />
                                                <Label htmlFor="campus-yes">Yes</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="no" id="campus-no" className="border-[#C26E26] text-[#C26E26]" />
                                                <Label htmlFor="campus-no">No</Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Will Graduate */}
                        <FormField
                            control={form.control}
                            name="willGraduate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Did or will you graduate from this school? <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-6"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="yes" id="graduate-yes" className="border-[#C26E26] text-[#C26E26]" />
                                                <Label htmlFor="graduate-yes">Yes</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="no" id="graduate-no" className="border-[#C26E26] text-[#C26E26]" />
                                                <Label htmlFor="graduate-no">No</Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Conditional: Exit Date or Graduation Date */}
                        {watchWillGraduate === 'no' && (
                            <div>
                                <Label className="text-sm font-medium">Date of Exit <span className="text-red-500">*</span></Label>
                                <div className="grid grid-cols-2 gap-4 mt-2 max-w-sm">
                                    <FormField
                                        control={form.control}
                                        name="exitMonth"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="focus:ring-[#C26E26]">
                                                            <SelectValue placeholder="Month" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {MONTHS.map((m) => (
                                                            <SelectItem key={m} value={m}>{m}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="exitYear"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="focus:ring-[#C26E26]">
                                                            <SelectValue placeholder="Year" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {YEARS.map((y) => (
                                                            <SelectItem key={y} value={y}>{y}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {watchWillGraduate === 'yes' && (
                            <div>
                                <Label className="text-sm font-medium">Graduation Date <span className="text-red-500">*</span></Label>
                                <div className="grid grid-cols-2 gap-4 mt-2 max-w-sm">
                                    <FormField
                                        control={form.control}
                                        name="graduationMonth"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="focus:ring-[#C26E26]">
                                                            <SelectValue placeholder="Month" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {MONTHS.map((m) => (
                                                            <SelectItem key={m} value={m}>{m}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="graduationYear"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="focus:ring-[#C26E26]">
                                                            <SelectValue placeholder="Year" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {GRADUATION_YEARS.map((y) => (
                                                            <SelectItem key={y} value={y}>{y}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Progression Changes */}
                        <FormField
                            control={form.control}
                            name="progressionChanges"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Progression Changes <span className="text-red-500">*</span></FormLabel>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        {PROGRESSION_OPTIONS.map((option) => (
                                            <div key={option} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`progression-${option}`}
                                                    checked={watchProgressionChanges.includes(option)}
                                                    onCheckedChange={(checked) =>
                                                        handleProgressionChange(option, checked as boolean)
                                                    }
                                                    className="border-[#C26E26] data-[state=checked]:bg-[#C26E26] data-[state=checked]:border-[#C26E26]"
                                                />
                                                <Label htmlFor={`progression-${option}`} className="text-sm cursor-pointer">
                                                    {option}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Conditional: Progression Details */}
                        {showProgressionDetails && (
                            <FormField
                                control={form.control}
                                name="progressionDetails"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Please provide details about the changes <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Explain the circumstances... (Max 250 words)"
                                                className="focus-visible:ring-[#C26E26] min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {field.value?.trim().split(/\s+/).filter(Boolean).length || 0}/250 words
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                </div>

                {/* Section 2: Grades */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                        Grades
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="classSize"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Graduating Class Size (Approx) <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            placeholder="e.g., 250"
                                            className="focus-visible:ring-[#C26E26] w-40"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="classRank"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Class Rank (if available)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., 15 of 250"
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
                            name="gpaScale"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>GPA Scale <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="focus:ring-[#C26E26] w-40">
                                                <SelectValue placeholder="Select scale" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {GPA_SCALES.map((scale) => (
                                                <SelectItem key={scale} value={scale}>{scale}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cumulativeGpa"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cumulative GPA <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            placeholder="e.g., 3.85"
                                            className="focus-visible:ring-[#C26E26] w-32"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="gpaType"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>GPA Type <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-6"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="weighted" id="gpa-weighted" className="border-[#C26E26] text-[#C26E26]" />
                                                <Label htmlFor="gpa-weighted">Weighted</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="unweighted" id="gpa-unweighted" className="border-[#C26E26] text-[#C26E26]" />
                                                <Label htmlFor="gpa-unweighted">Unweighted</Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Section 3: Future Plans */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                        Future Plans
                    </h3>

                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="studentStatus"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Student Status <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-wrap gap-4"
                                        >
                                            {STUDENT_STATUS_OPTIONS.map((status) => (
                                                <div key={status} className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value={status}
                                                        id={`status-${status}`}
                                                        className="border-[#C26E26] text-[#C26E26]"
                                                    />
                                                    <Label htmlFor={`status-${status}`}>{status}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="highestDegree"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Highest Degree Intended <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="focus:ring-[#C26E26]">
                                                    <SelectValue placeholder="Select degree" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {DEGREES.map((degree) => (
                                                    <SelectItem key={degree} value={degree}>{degree}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="careerInterest"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Career Interest <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="focus:ring-[#C26E26]">
                                                    <SelectValue placeholder="Select career" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {CAREERS.map((career) => (
                                                    <SelectItem key={career} value={career}>{career}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Conditional: Other Career */}
                        {watchCareerInterest === 'Other' && (
                            <FormField
                                control={form.control}
                                name="otherCareer"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Other Career Interest <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Specify your career interest"
                                                className="focus-visible:ring-[#C26E26]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="bg-[#C26E26] hover:bg-[#A85A1E] text-white px-8 py-2"
                    >
                        {form.formState.isSubmitting ? 'Saving...' : 'Save Education Details'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
