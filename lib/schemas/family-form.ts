import { z } from 'zod';

// Parent schema
const parentSchema = z.object({
    id: z.string().optional(), // For key management
    relationship: z.string().min(1, 'Relationship is required'),
    age: z.coerce.number().min(1, 'Age must be positive').max(120, 'Invalid age'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    isLiving: z.enum(['yes', 'no'] as const),
    educationLevel: z.string().min(1, 'Education level is required'),
    occupation: z.string().min(1, 'Occupation is required'),
    employer: z.string().optional(),
});

// Sibling schema
const siblingSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    age: z.coerce.number().min(0, 'Age is required').max(100, 'Invalid age'),
});

// Base schema
export const familyFormSchema = z.object({
    // Section 1: Household Information
    maritalStatus: z.string().min(1, 'Marital status is required'),
    permanentResidence: z.string().min(1, 'Permanent residence is required'),
    hasChildren: z.string().optional(),
    numberOfChildren: z.coerce.number().min(1).optional(),

    // Section 2: Parents
    parents: z.array(parentSchema).max(4, 'Maximum 4 parents allowed'),

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

export const RELATIONSHIP_OPTIONS = [
    'Father',
    'Mother',
    'Step-Father',
    'Step-Mother',
    'Legal Guardian',
    'Other',
];

export const EDUCATION_LEVELS = [
    'No Schooling',
    'High School',
    'Some College',
    'Bachelor\'s',
    'Master\'s',
    'Doctorate/Professional',
];



