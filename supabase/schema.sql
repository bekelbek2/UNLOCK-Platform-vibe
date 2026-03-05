-- ============================================================
-- UNLOCK Platform — Supabase Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL → New Query)
-- ============================================================

-- 0. Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS — extends auth.users with app-level role
-- ============================================================
CREATE TABLE public.users (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    full_name   TEXT NOT NULL DEFAULT '',
    role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read all users"
    ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own record"
    ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own record"
    ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create a users row when someone signs up via auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. PROFILES — extended student info
-- ============================================================
CREATE TABLE public.profiles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    phone           TEXT,
    date_of_birth   DATE,
    country         TEXT,
    city            TEXT,
    school_name     TEXT,
    grade           TEXT,
    gpa             TEXT,
    sat_score       TEXT,
    ielts_score     TEXT,
    target_major    TEXT,
    bio             TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read profiles"
    ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own profile"
    ON public.profiles FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 3. UNIVERSITIES — master catalog
-- ============================================================
CREATE TABLE public.universities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    country         TEXT NOT NULL DEFAULT '',
    state           TEXT,
    city            TEXT,
    rank            INT,
    logo_url        TEXT,
    website_url     TEXT,
    acceptance_rate NUMERIC(5,2),
    type            TEXT DEFAULT 'university' CHECK (type IN ('university', 'program')),
    tags            TEXT[] DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read universities"
    ON public.universities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage universities"
    ON public.universities FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================
-- 4. APPLICATIONS — student → university link
-- ============================================================
CREATE TABLE public.applications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    university_id   UUID REFERENCES public.universities(id) ON DELETE SET NULL,
    university_name TEXT NOT NULL DEFAULT '',
    entity_type     TEXT NOT NULL DEFAULT 'university' CHECK (entity_type IN ('university', 'program')),
    term            TEXT,
    admission_plan  TEXT,
    deadline        DATE,
    status          TEXT NOT NULL DEFAULT 'Not Started'
                    CHECK (status IN ('Not Started', 'In Progress', 'Submitted', 'Accepted', 'Rejected', 'Waitlisted')),
    majors          JSONB DEFAULT '{}',
    supplements     JSONB DEFAULT '[]',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own applications"
    ON public.applications FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own applications"
    ON public.applications FOR ALL TO authenticated
    USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all applications"
    ON public.applications FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================
-- 5. DOCUMENTS — essays, supplements, etc.
-- ============================================================
CREATE TABLE public.documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL DEFAULT 'Untitled',
    content         TEXT DEFAULT '',
    word_count      INT DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'Draft'
                    CHECK (status IN ('Draft', 'In Review', 'Final')),
    document_type   TEXT DEFAULT 'essay'
                    CHECK (document_type IN ('essay', 'supplement', 'recommendation', 'other')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own documents"
    ON public.documents FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own documents"
    ON public.documents FOR ALL TO authenticated
    USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all documents"
    ON public.documents FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================
-- 6. STUDY PLANS — admin-created curriculum plans
-- ============================================================
CREATE TABLE public.study_plans (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    student_name        TEXT NOT NULL DEFAULT '',
    program_type        TEXT NOT NULL DEFAULT '360 Full-Support'
                        CHECK (program_type IN ('360 Full-Support', 'Powder Group', 'Ambulance')),
    student_stats       JSONB DEFAULT '{}',
    selected_sessions   TEXT[] DEFAULT '{}',
    x_sessions          JSONB DEFAULT '[]',
    mentors             JSONB DEFAULT '[]',
    total_price         NUMERIC(10,2) DEFAULT 0,
    status              TEXT NOT NULL DEFAULT 'New'
                        CHECK (status IN ('New', 'In Progress', 'Completed')),
    created_by          UUID REFERENCES public.users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can read own study plans"
    ON public.study_plans FOR SELECT TO authenticated
    USING (auth.uid() = student_id);
CREATE POLICY "Admins can manage all study plans"
    ON public.study_plans FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_university_id ON public.applications(university_id);
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_study_plans_student_id ON public.study_plans(student_id);
CREATE INDEX idx_universities_type ON public.universities(type);

-- ============================================================
-- Done! All tables created with RLS enabled.
-- ============================================================
