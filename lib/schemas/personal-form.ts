import { z } from 'zod';

export const personalFormSchema = z.object({
    // Personal Information
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.date({
        required_error: 'Date of birth is required',
    }),

    // Address
    streetName: z.string().min(1, 'Street name is required'),
    city: z.string().min(1, 'City is required'),
    stateProvince: z.string().min(1, 'State/Province is required'),
    country: z.string().min(1, 'Country is required'),
    zipCode: z.string().optional(),

    // Contact Details
    phoneNumber: z.string().min(1, 'Phone number is required'),

    // Demographics
    gender: z.string().min(1, 'Gender is required'),
    ethnicity: z.string().min(1, 'Race/Ethnicity is required'),

    // Nationality
    countryOfBirth: z.string().min(1, 'Country of birth is required'),
    countriesOfCitizenship: z.array(z.string()).min(1, 'At least one country of citizenship is required'),
});

export type PersonalFormData = z.infer<typeof personalFormSchema>;

// Data constants
export const COUNTRIES = [
    'Afghanistan',
    'Albania',
    'Algeria',
    'Argentina',
    'Australia',
    'Austria',
    'Bangladesh',
    'Belgium',
    'Brazil',
    'Canada',
    'Chile',
    'China',
    'Colombia',
    'Cuba',
    'Czech Republic',
    'Denmark',
    'Egypt',
    'Ethiopia',
    'Finland',
    'France',
    'Germany',
    'Ghana',
    'Greece',
    'India',
    'Indonesia',
    'Iran',
    'Iraq',
    'Ireland',
    'Israel',
    'Italy',
    'Japan',
    'Jordan',
    'Kenya',
    'Malaysia',
    'Mexico',
    'Morocco',
    'Netherlands',
    'New Zealand',
    'Nigeria',
    'Norway',
    'Pakistan',
    'Peru',
    'Philippines',
    'Poland',
    'Portugal',
    'Russia',
    'Saudi Arabia',
    'Singapore',
    'South Africa',
    'South Korea',
    'Spain',
    'Sri Lanka',
    'Sweden',
    'Switzerland',
    'Thailand',
    'Turkey',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'Uzbekistan',
    'Venezuela',
    'Vietnam',
];

export const GENDERS = ['Male', 'Female'];

export const ETHNICITIES = [
    'American Indian or Alaska Native',
    'Asian',
    'Black or African American',
    'Hispanic or Latino',
    'Native Hawaiian or Other Pacific Islander',
    'White',
    'Two or More Races',
    'Prefer not to say',
];
