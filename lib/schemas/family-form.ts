import { z } from 'zod';

// Parent schema
const parentSchema = z.object({
    relationship: z.string().min(1, 'Relationship is required'),
    isLiving: z.string().min(1, 'Please specify if parent is living'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    occupation: z.string().min(1, 'Occupation is required'),
    educationLevel: z.string().min(1, 'Education level is required'),
});

// Sibling schema
const siblingSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    age: z.coerce.number().min(0, 'Age is required').max(100, 'Invalid age'),
});

// Base schema without refine for use with useForm
export const familyFormSchema = z.object({
    // Section 1: Household Information
    maritalStatus: z.string().min(1, 'Marital status is required'),
    permanentResidence: z.string().min(1, 'Permanent residence is required'),
    hasChildren: z.string().optional(),
    numberOfChildren: z.coerce.number().min(1).optional(),

    // Section 2: Parent/Guardian Information
    parent1: parentSchema,
    parent2: parentSchema,

    // Section 3: Siblings
    numberOfSiblings: z.coerce.number().min(0).max(10),
    siblings: z.array(siblingSchema),
});

export type FamilyFormData = z.infer<typeof familyFormSchema>;

// Data constants
export const MARITAL_STATUS_OPTIONS = [
    'Married',
    'Separated',
    'Divorced',
    'Widowed',
    'Never Married',
];

export const RESIDENCE_OPTIONS = [
    'With both parents',
    'With mother',
    'With father',
    'With legal guardian',
    'Independent',
];

export const RELATIONSHIP_OPTIONS = ['Mother', 'Father'];

export const EDUCATION_LEVELS = [
    'No Schooling',
    'High School',
    'Some College',
    'Bachelor\'s',
    'Master\'s',
    'Doctorate/Professional',
];
