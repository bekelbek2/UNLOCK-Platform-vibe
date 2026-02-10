'use client';

import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface CountryCode {
    code: string;
    country: string;
    dialCode: string;
}

const COUNTRY_CODES: CountryCode[] = [
    { code: 'US', country: 'United States', dialCode: '+1' },
    { code: 'GB', country: 'United Kingdom', dialCode: '+44' },
    { code: 'CA', country: 'Canada', dialCode: '+1' },
    { code: 'AU', country: 'Australia', dialCode: '+61' },
    { code: 'DE', country: 'Germany', dialCode: '+49' },
    { code: 'FR', country: 'France', dialCode: '+33' },
    { code: 'IT', country: 'Italy', dialCode: '+39' },
    { code: 'ES', country: 'Spain', dialCode: '+34' },
    { code: 'NL', country: 'Netherlands', dialCode: '+31' },
    { code: 'BE', country: 'Belgium', dialCode: '+32' },
    { code: 'CH', country: 'Switzerland', dialCode: '+41' },
    { code: 'AT', country: 'Austria', dialCode: '+43' },
    { code: 'SE', country: 'Sweden', dialCode: '+46' },
    { code: 'NO', country: 'Norway', dialCode: '+47' },
    { code: 'DK', country: 'Denmark', dialCode: '+45' },
    { code: 'FI', country: 'Finland', dialCode: '+358' },
    { code: 'PL', country: 'Poland', dialCode: '+48' },
    { code: 'RU', country: 'Russia', dialCode: '+7' },
    { code: 'CN', country: 'China', dialCode: '+86' },
    { code: 'JP', country: 'Japan', dialCode: '+81' },
    { code: 'KR', country: 'South Korea', dialCode: '+82' },
    { code: 'IN', country: 'India', dialCode: '+91' },
    { code: 'PK', country: 'Pakistan', dialCode: '+92' },
    { code: 'BD', country: 'Bangladesh', dialCode: '+880' },
    { code: 'ID', country: 'Indonesia', dialCode: '+62' },
    { code: 'MY', country: 'Malaysia', dialCode: '+60' },
    { code: 'SG', country: 'Singapore', dialCode: '+65' },
    { code: 'TH', country: 'Thailand', dialCode: '+66' },
    { code: 'VN', country: 'Vietnam', dialCode: '+84' },
    { code: 'PH', country: 'Philippines', dialCode: '+63' },
    { code: 'AE', country: 'United Arab Emirates', dialCode: '+971' },
    { code: 'SA', country: 'Saudi Arabia', dialCode: '+966' },
    { code: 'EG', country: 'Egypt', dialCode: '+20' },
    { code: 'NG', country: 'Nigeria', dialCode: '+234' },
    { code: 'ZA', country: 'South Africa', dialCode: '+27' },
    { code: 'KE', country: 'Kenya', dialCode: '+254' },
    { code: 'GH', country: 'Ghana', dialCode: '+233' },
    { code: 'BR', country: 'Brazil', dialCode: '+55' },
    { code: 'MX', country: 'Mexico', dialCode: '+52' },
    { code: 'AR', country: 'Argentina', dialCode: '+54' },
    { code: 'CO', country: 'Colombia', dialCode: '+57' },
    { code: 'CL', country: 'Chile', dialCode: '+56' },
    { code: 'PE', country: 'Peru', dialCode: '+51' },
    { code: 'VE', country: 'Venezuela', dialCode: '+58' },
    { code: 'TR', country: 'Turkey', dialCode: '+90' },
    { code: 'IL', country: 'Israel', dialCode: '+972' },
    { code: 'IR', country: 'Iran', dialCode: '+98' },
    { code: 'IQ', country: 'Iraq', dialCode: '+964' },
    { code: 'AF', country: 'Afghanistan', dialCode: '+93' },
    { code: 'UZ', country: 'Uzbekistan', dialCode: '+998' },
    { code: 'KZ', country: 'Kazakhstan', dialCode: '+7' },
    { code: 'UA', country: 'Ukraine', dialCode: '+380' },
    { code: 'NZ', country: 'New Zealand', dialCode: '+64' },
    { code: 'IE', country: 'Ireland', dialCode: '+353' },
    { code: 'PT', country: 'Portugal', dialCode: '+351' },
    { code: 'GR', country: 'Greece', dialCode: '+30' },
    { code: 'CZ', country: 'Czech Republic', dialCode: '+420' },
    { code: 'HU', country: 'Hungary', dialCode: '+36' },
    { code: 'RO', country: 'Romania', dialCode: '+40' },
].sort((a, b) => a.country.localeCompare(b.country));

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function PhoneInput({ value, onChange, className }: PhoneInputProps) {
    const [open, setOpen] = React.useState(false);

    // Parse value to extract dial code and number
    const parseValue = (val: string): { dialCode: string; number: string } => {
        if (!val) return { dialCode: '+1', number: '' };

        // Find matching country code
        for (const country of COUNTRY_CODES) {
            if (val.startsWith(country.dialCode)) {
                return {
                    dialCode: country.dialCode,
                    number: val.slice(country.dialCode.length).trim(),
                };
            }
        }

        return { dialCode: '+1', number: val.replace(/^\+\d+\s*/, '') };
    };

    const { dialCode, number } = parseValue(value);

    const selectedCountry = COUNTRY_CODES.find((c) => c.dialCode === dialCode) || COUNTRY_CODES[0];

    const handleDialCodeChange = (newDialCode: string) => {
        onChange(`${newDialCode}${number}`);
        setOpen(false);
    };

    const handleNumberChange = (newNumber: string) => {
        // Only allow digits
        const cleaned = newNumber.replace(/\D/g, '');
        onChange(`${dialCode}${cleaned}`);
    };

    return (
        <div className={cn('flex', className)}>
            {/* Country Code Dropdown */}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            'flex items-center gap-1 px-3 h-10 border border-r-0 rounded-l-md bg-gray-50',
                            'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#C26E26] focus:ring-offset-0',
                            'text-sm font-medium text-gray-700 min-w-[80px] justify-between'
                        )}
                    >
                        <span>{dialCode}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0" align="start">
                    <div className="max-h-[300px] overflow-y-auto">
                        {COUNTRY_CODES.map((country) => {
                            const isSelected = country.dialCode === dialCode;
                            return (
                                <button
                                    key={`${country.code}-${country.dialCode}`}
                                    type="button"
                                    onClick={() => handleDialCodeChange(country.dialCode)}
                                    className={cn(
                                        'w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors',
                                        isSelected
                                            ? 'bg-gray-900 text-white'
                                            : 'hover:bg-gray-100'
                                    )}
                                >
                                    {isSelected && <Check className="h-4 w-4" />}
                                    <span className={cn('font-medium', !isSelected && 'ml-6')}>
                                        {country.dialCode}
                                    </span>
                                    <span className={isSelected ? 'text-gray-200' : 'text-gray-600'}>
                                        {country.country}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </PopoverContent>
            </Popover>

            {/* Phone Number Input */}
            <Input
                type="tel"
                value={number}
                onChange={(e) => handleNumberChange(e.target.value)}
                placeholder="000 000 0000"
                className="rounded-l-none focus-visible:ring-[#C26E26] flex-1"
            />
        </div>
    );
}
