'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { MultiSelect } from '@/components/ui/multi-select';
import { PhoneInput } from '@/components/ui/phone-input';
import { cn } from '@/lib/utils';
import {
    personalFormSchema,
    type PersonalFormData,
    COUNTRIES,
    GENDERS,
    ETHNICITIES,
} from '@/lib/schemas/personal-form';

export default function PersonalTab() {
    const form = useForm<PersonalFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(personalFormSchema) as any,
        defaultValues: {
            firstName: '',
            lastName: '',
            dateOfBirth: undefined,
            streetName: '',
            city: '',
            stateProvince: '',
            country: '',
            zipCode: '',
            phoneNumber: '+1',
            gender: '',
            ethnicity: '',
            countryOfBirth: '',
            countriesOfCitizenship: [],
        },
    });

    const onSubmit = async (data: PersonalFormData) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log('Form submitted:', data);
        toast.success('Personal details saved.', {
            description: 'Your personal information has been updated successfully.',
        });
    };

    // Calculate the start year for the date picker (at least 2000)
    const currentYear = new Date().getFullYear();
    const fromYear = 1950;
    const toYear = currentYear - 10; // Students are at least 10 years old

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Section 1: Personal Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your first name"
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
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your last name"
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
                            name="dateOfBirth"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full md:w-[300px] pl-3 text-left font-normal',
                                                        'focus:ring-2 focus:ring-[#C26E26] focus:ring-offset-0',
                                                        !field.value && 'text-muted-foreground'
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, 'MMMM d, yyyy')
                                                    ) : (
                                                        <span>Select your date of birth</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date('1950-01-01')
                                                }
                                                captionLayout="dropdown"
                                                fromYear={fromYear}
                                                toYear={toYear}
                                                defaultMonth={field.value || new Date(2005, 0)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Section 2: Address */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                        Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="streetName"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Street Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your street address"
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
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your city"
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
                                            placeholder="Enter your state or province"
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
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="focus:ring-[#C26E26]">
                                                <SelectValue placeholder="Select your country" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {COUNTRIES.map((country) => (
                                                <SelectItem key={country} value={country}>
                                                    {country}
                                                </SelectItem>
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
                                            placeholder="Enter your zip code"
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

                {/* Section 3: Contact Details */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                        Contact Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <PhoneInput
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Section 4: Demographics */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                        Demographics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="focus:ring-[#C26E26]">
                                                <SelectValue placeholder="Select your gender" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {GENDERS.map((gender) => (
                                                <SelectItem key={gender} value={gender}>
                                                    {gender}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="ethnicity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Race/Ethnicity <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="focus:ring-[#C26E26]">
                                                <SelectValue placeholder="Select your race/ethnicity" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ETHNICITIES.map((ethnicity) => (
                                                <SelectItem key={ethnicity} value={ethnicity}>
                                                    {ethnicity}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Section 5: Nationality */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                        Nationality
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="countryOfBirth"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country of Birth <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="focus:ring-[#C26E26]">
                                                <SelectValue placeholder="Select your country of birth" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {COUNTRIES.map((country) => (
                                                <SelectItem key={country} value={country}>
                                                    {country}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="countriesOfCitizenship"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Country of Citizenship <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={COUNTRIES}
                                            selected={field.value}
                                            onChange={field.onChange}
                                            placeholder="Select countries (dual citizenship allowed)"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="bg-[#C26E26] hover:bg-[#A85A1E] text-white px-8 py-2"
                    >
                        {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
