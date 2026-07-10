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
    deleted_at TIMESTAMP WITH TIME ZONE,
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

-- Write/Update Policies for Report Media, Comments, and Votes
ALTER TABLE public.report_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public videos read" ON public.report_videos FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert report images" ON public.report_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert report videos" ON public.report_videos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert support votes" ON public.support_votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete their own support votes" ON public.support_votes FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Policies for Notifications
CREATE POLICY "Authenticated users can read their own notifications" ON public.notifications FOR SELECT USING (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Authenticated users can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);


-- Seed Municipalities and Wards for Dang District

-- Create Temp Table for bulk inserting municipalities and mapping wards
CREATE TEMP TABLE temp_muni (
    local_id VARCHAR(50),
    name VARCHAR(100),
    nepali_name VARCHAR(100),
    type VARCHAR(50),
    headquarters VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    ward_count INTEGER
);

INSERT INTO temp_muni (local_id, name, nepali_name, type, headquarters, latitude, longitude, ward_count) VALUES
('ghorahi', 'Ghorahi Sub-Metropolitan City', 'घोराही उपमहानगरपालिका', 'Sub-Metropolitan City', 'Ghorahi', 28.062, 82.484, 19),
('tulsipur', 'Tulsipur Sub-Metropolitan City', 'तुलसीपुर उपमहानगरपालिका', 'Sub-Metropolitan City', 'Tulsipur', 28.131, 82.296, 19),
('lamahi', 'Lamahi Municipality', 'लमही नगरपालिका', 'Municipality', 'Lamahi', 27.876, 82.548, 9),
('rapti', 'Rapti Rural Municipality', 'राप्ती गाउँपालिका', 'Rural Municipality', 'Masuriya', 27.858, 82.695, 9),
('gadhawa', 'Gadhawa Rural Municipality', 'गढवा गाउँपालिका', 'Rural Municipality', 'Gadhawa', 27.818, 82.518, 8),
('dangisharan', 'Dangisharan Rural Municipality', 'दंगीशरण गाउँपालिका', 'Rural Municipality', 'Hekuli', 28.113, 82.189, 7),
('babai', 'Babai Rural Municipality', 'बबई गाउँपालिका', 'Rural Municipality', 'Tulasipur (Hapur)', 28.188, 82.072, 7),
('shantinagar', 'Shantinagar Rural Municipality', 'शान्तिनगर गाउँपालिका', 'Rural Municipality', 'Chirahana', 28.214, 82.176, 7),
('bangalachuli', 'Bangalachuli Rural Municipality', 'बंगलाचुली गाउँपालिका', 'Rural Municipality', 'Kavre', 28.147, 82.585, 8),
('rajpur', 'Rajpur Rural Municipality', 'राजपुर गाउँपालिका', 'Rural Municipality', 'Gangapraspur', 27.765, 82.342, 7);

-- Insert into public.municipalities and generate wards
DO $$
DECLARE
    muni_rec RECORD;
    new_muni_id UUID;
    w_num INT;
BEGIN
    FOR muni_rec IN SELECT * FROM temp_muni LOOP
        -- Insert municipality
        INSERT INTO public.municipalities (name, nepali_name, type, headquarters, latitude, longitude)
        VALUES (muni_rec.name, muni_rec.nepali_name, muni_rec.type, muni_rec.headquarters, muni_rec.latitude, muni_rec.longitude)
        RETURNING id INTO new_muni_id;

        -- Generate and insert wards for this municipality
        FOR w_num IN 1..muni_rec.ward_count LOOP
            INSERT INTO public.wards (municipality_id, ward_number)
            VALUES (new_muni_id, w_num);
        END LOOP;
    END LOOP;
END $$;

DROP TABLE temp_muni;

-- Seed budgets for demonstration
INSERT INTO public.budgets (entity_type, entity_id, year, category, allocated, spent)
SELECT 
    'ward', 
    w.id, 
    '2082/83', 
    'Infrastructure & Development', 
    5000000, 
    3200000
FROM public.wards w
JOIN public.municipalities m ON w.municipality_id = m.id
WHERE m.name = 'Ghorahi Sub-Metropolitan City' AND w.ward_number = 15;

INSERT INTO public.budgets (entity_type, entity_id, year, category, allocated, spent)
SELECT 
    'ward', 
    w.id, 
    '2082/83', 
    'Infrastructure & Development', 
    3500000, 
    1100000
FROM public.wards w
JOIN public.municipalities m ON w.municipality_id = m.id
WHERE m.name = 'Ghorahi Sub-Metropolitan City' AND w.ward_number = 2;

INSERT INTO public.budgets (entity_type, entity_id, year, category, allocated, spent)
SELECT 
    'ward', 
    w.id, 
    '2082/83', 
    'Infrastructure & Development', 
    4500000, 
    2800000
FROM public.wards w
JOIN public.municipalities m ON w.municipality_id = m.id
WHERE m.name = 'Tulsipur Sub-Metropolitan City' AND w.ward_number = 5;

INSERT INTO public.budgets (entity_type, entity_id, year, category, allocated, spent)
SELECT 
    'ward', 
    w.id, 
    '2082/83', 
    'Infrastructure & Development', 
    3000000, 
    900000
FROM public.wards w
JOIN public.municipalities m ON w.municipality_id = m.id
WHERE m.name = 'Tulsipur Sub-Metropolitan City' AND w.ward_number = 12;

INSERT INTO public.budgets (entity_type, entity_id, year, category, allocated, spent)
SELECT 
    'ward', 
    w.id, 
    '2082/83', 
    'Infrastructure & Development', 
    2500000, 
    2100000
FROM public.wards w
JOIN public.municipalities m ON w.municipality_id = m.id
WHERE m.name = 'Lamahi Municipality' AND w.ward_number = 3;

