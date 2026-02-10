'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface PersonalFormData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    citizenship: string;
    primaryLanguage: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'Japan',
    'India',
    'China',
    'Brazil',
    'Mexico',
    'Other',
];

const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Mandarin',
    'Japanese',
    'Hindi',
    'Portuguese',
    'Arabic',
    'Russian',
    'Other',
];

export default function PersonalForm() {
    const [formData, setFormData] = useState<PersonalFormData>({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        citizenship: '',
        primaryLanguage: '',
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleInputChange = (field: keyof PersonalFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);

        // Mock save action - simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast.success('Profile saved successfully!', {
            description: 'Your personal information has been updated.',
        });

        setIsSaving(false);
    };

    return (
        <div className="space-y-8">
            {/* Personal Information Section */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            placeholder="Enter your first name"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            placeholder="Enter your last name"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                            id="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="citizenship">Citizenship</Label>
                        <Select
                            value={formData.citizenship}
                            onValueChange={(value) => handleInputChange('citizenship', value)}
                        >
                            <SelectTrigger id="citizenship">
                                <SelectValue placeholder="Select your citizenship" />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map((country) => (
                                    <SelectItem key={country} value={country}>
                                        {country}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="primaryLanguage">Primary Language</Label>
                        <Select
                            value={formData.primaryLanguage}
                            onValueChange={(value) => handleInputChange('primaryLanguage', value)}
                        >
                            <SelectTrigger id="primaryLanguage">
                                <SelectValue placeholder="Select your primary language" />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map((language) => (
                                    <SelectItem key={language} value={language}>
                                        {language}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Address Section */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="streetAddress">Street Address</Label>
                        <Input
                            id="streetAddress"
                            placeholder="Enter your street address"
                            value={formData.streetAddress}
                            onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            placeholder="Enter your city"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="state">State / Province</Label>
                        <Input
                            id="state"
                            placeholder="Enter your state or province"
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                        <Input
                            id="zipCode"
                            placeholder="Enter your ZIP code"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                            value={formData.country}
                            onValueChange={(value) => handleInputChange('country', value)}
                        >
                            <SelectTrigger id="country">
                                <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map((country) => (
                                    <SelectItem key={country} value={country}>
                                        {country}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#D97706] hover:bg-[#B45309] text-white px-8"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
}
