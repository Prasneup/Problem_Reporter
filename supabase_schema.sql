-- Supabase Schema for Dang District Smart City Problem Reporter

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Municipalities Table
CREATE TABLE public.municipalities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    nepali_name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Municipality', 'Sub-Metropolitan City', 'Rural Municipality')),
    headquarters VARCHAR(100),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    budget_allocated NUMERIC(15, 2) DEFAULT 0.00,
    budget_spent NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Wards Table
CREATE TABLE public.wards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    municipality_id UUID REFERENCES public.municipalities(id) ON DELETE CASCADE,
    ward_number INTEGER NOT NULL,
    road_index INT DEFAULT 100,
    drainage_index INT DEFAULT 100,
    lighting_index INT DEFAULT 100,
    water_index INT DEFAULT 100,
    budget_allocated NUMERIC(15, 2) DEFAULT 0.00,
    budget_spent NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (municipality_id, ward_number)
);

-- 4. Profiles Table (Linked to Supabase Auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY, -- Same as auth.users.id
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'Citizen' CHECK (role IN ('Citizen', 'Community Verifier', 'Field Inspector', 'Ward Officer', 'Municipality Officer', 'District Administrator', 'Super Admin')),
    municipality_id UUID REFERENCES public.municipalities(id),
    ward_id UUID REFERENCES public.wards(id),
    reputation_points INT DEFAULT 0,
    badge_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Reports Table
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Road Damage', 'Potholes', 'Garbage', 'Water Supply', 'Drainage', 'Electricity', 'Street Lights', 'Environmental Issues', 'Public Safety', 'Infrastructure Problems', 'Other', 'Emergency')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    municipality_id UUID REFERENCES public.municipalities(id),
    ward_id UUID REFERENCES public.wards(id),
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'AI_Flagged', 'Under_Review', 'Verified', 'Assigned', 'In_Progress', 'Resolved', 'Rejected', 'Reopened', 'Closed')),
    priority VARCHAR(30) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical', 'Emergency')),
    support_count INTEGER DEFAULT 0,
    duplicate_count INTEGER DEFAULT 0,
    assigned_department VARCHAR(100),
    budget_estimated NUMERIC(12, 2) DEFAULT 0.00,
    budget_spent NUMERIC(12, 2) DEFAULT 0.00,
    is_emergency BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Report Images Table
CREATE TABLE public.report_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    image_type VARCHAR(20) DEFAULT 'before' CHECK (image_type IN ('before', 'after')),
    ai_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Report Videos Table
CREATE TABLE public.report_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Comments Table
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_official_update BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Support Votes Table
CREATE TABLE public.support_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (report_id, user_id)
);

-- 10. Verification Logs Table
CREATE TABLE public.verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    verifier_id UUID REFERENCES public.profiles(id),
    verification_type VARCHAR(50) CHECK (verification_type IN ('citizen_verifier', 'ward_officer', 'field_inspector')),
    status_change VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. Assignments Table
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    inspector_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    status VARCHAR(30) DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'In_Transit', 'Inspecting', 'Completed', 'Failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 12. Budgets Table
CREATE TABLE public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('municipality', 'ward')),
    entity_id UUID NOT NULL, -- references municipalities or wards ID
    year VARCHAR(10) NOT NULL,
    category VARCHAR(100) NOT NULL,
    allocated NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    spent NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    remaining NUMERIC(12,2) GENERATED ALWAYS AS (allocated - spent) STORED
);

-- 13. Badges Table
CREATE TABLE public.badges (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon_type VARCHAR(50) NOT NULL,
    points_threshold INTEGER NOT NULL
);

-- 14. Audit Logs Table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_value JSONB,
    new_value JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 15. Notifications Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'system', 'escalation', 'reward')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security (RLS) Enablement
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Select RLS Policies (Read Access is mostly Public)
CREATE POLICY "Public municipalities read" ON public.municipalities FOR SELECT USING (true);
CREATE POLICY "Public wards read" ON public.wards FOR SELECT USING (true);
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public reports read" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Public images read" ON public.report_images FOR SELECT USING (true);
CREATE POLICY "Public comments read" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public budgets read" ON public.budgets FOR SELECT USING (true);

-- Insert Policy for Profiles
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Write/Update Policies for Reports (Only Authenticated Citizens or Officers)
CREATE POLICY "Citizens can create reports" ON public.reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Reporters can update their own reports" ON public.reports FOR UPDATE USING (auth.uid() = reporter_id);
CREATE POLICY "Officers can manage all reports" ON public.reports FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Ward Officer', 'Municipality Officer', 'District Administrator', 'Super Admin'))
);
