import { z } from 'zod';

// Constants for dropdowns
export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const YEARS = Array.from({ length: 30 }, (_, i) => String(2000 + i)); // 2000-2029
export const GRADUATION_YEARS = Array.from({ length: 32 }, (_, i) => String(2000 + i)); // 2000-2031

export const SCHOOL_TYPES = [
    'Public', 'Private', 'Homeschool', 'Charter', 'Independent', 'Religious'
];

export const PROGRESSION_OPTIONS = [
    'Graduate Early', 'Graduate Late', 'Take Time Off', 'Gap Year', 'No Change'
];

export const GPA_SCALES = [
    '4.0', '5.0', '6.0', '7.0', '8.0', '9.0', '10.0',
    '11.0', '12.0', '13.0', '14.0', '15.0', '16.0', '17.0', '18.0', '19.0', '20.0',
    '100', 'None'
];

export const GRADE_LEVELS = ['9', '10', '11', '12', 'Post-graduate'];
export const RECOGNITION_LEVELS = ['School', 'Regional', 'National', 'International'];

export const STUDENT_STATUS_OPTIONS = [
    'Applying for 2025/2026',
    'Start 2027',
    'Start 2028+',
    'Already Student'
];

export const DEGREES = [
    'Associate', 'Bachelors', 'Masters', 'PhD', 'JD', 'MD', 'MBA',
    'DDS', 'PharmD', 'DVM', 'EdD', 'Other'
];

export const CAREERS = [
    'Accounting', 'Architecture', 'Business', 'Computer Science', 'Education',
    'Engineering', 'Finance', 'Healthcare', 'Law', 'Marketing', 'Medicine',
    'Music', 'Nursing', 'Pharmacy', 'Psychology', 'Research', 'Social Work',
    'Technology', 'Other'
];

// Honor schema
const honorSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Max 100 characters'),
    gradeLevels: z.array(z.string()).min(1, 'Select at least one grade level'),
    recognitionLevels: z.array(z.string()).min(1, 'Select at least one recognition level'),
});

// Main education schema (without superRefine to avoid type inference issues)
export const educationFormSchema = z.object({
    // Section 1: High School
    highSchoolName: z.string().min(1, 'High school name is required'),
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    stateProvince: z.string().min(1, 'State/Province is required'),
    country: z.string().min(1, 'Country is required'),
    zipCode: z.string().optional(),
    schoolType: z.string().min(1, 'School type is required'),
    entryMonth: z.string().min(1, 'Entry month is required'),
    entryYear: z.string().min(1, 'Entry year is required'),
    isBoardingSchool: z.string().min(1, 'Please select an option'),
    livesOnCampus: z.string().min(1, 'Please select an option'),
    willGraduate: z.string().min(1, 'Please select an option'),
    exitMonth: z.string().optional(),
    exitYear: z.string().optional(),
    graduationMonth: z.string().optional(),
    graduationYear: z.string().optional(),
    progressionChanges: z.array(z.string()).min(1, 'Please select at least one option'),
    progressionDetails: z.string().optional(),

    // Section 2: Grades
    classSize: z.coerce.number().min(1, 'Class size is required'),
    classRank: z.string().optional(),
    gpaScale: z.string().min(1, 'GPA scale is required'),
    cumulativeGpa: z.coerce.number().min(0, 'GPA is required').max(100, 'Invalid GPA'),
    gpaType: z.string().min(1, 'GPA type is required'),

    // Section 3: Future Plans
    studentStatus: z.string().min(1, 'Student status is required'),
    highestDegree: z.string().min(1, 'Highest degree is required'),
    careerInterest: z.string().min(1, 'Career interest is required'),
    otherCareer: z.string().optional(),
});

export type EducationFormData = z.infer<typeof educationFormSchema>;
