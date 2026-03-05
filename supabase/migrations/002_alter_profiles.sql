-- ============================================================
-- UNLOCK Platform — ALTER profiles table
-- Adds comprehensive application fields
-- Run this in Supabase SQL Editor BEFORE deploying the new code.
-- ============================================================

-- Basics (full_name, email, role already added previously)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';

-- Academics
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS high_school_curriculum TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS graduation_date TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grades JSONB DEFAULT '{}';

-- Goals
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS intended_major TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_destinations TEXT[] DEFAULT '{}';

-- Family
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS parent_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS parent_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS parent_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS household_income TEXT;

-- Test Scores
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS act_score TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS toefl_score TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS duolingo_score TEXT;

-- Extras (complex data stored as JSONB)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS extracurriculars JSONB DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS honors_and_awards JSONB DEFAULT '[]';

-- Additional structured data stored as JSONB
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS personal_data JSONB DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS family_data JSONB DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education_data JSONB DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS test_scores_data JSONB DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS finance_data JSONB DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS essays_data JSONB DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS recommendations_data JSONB DEFAULT '[]';

-- ============================================================
-- Done! Run this before deploying the new profileStore code.
-- ============================================================
