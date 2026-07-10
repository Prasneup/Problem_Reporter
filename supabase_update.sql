-- Supabase SQL Update Script for Ghorahi Sub-Metropolitan City Problem Reporter
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Migrate any existing profiles with old roles to the new roles
UPDATE public.profiles 
SET role = 'Admin' 
WHERE role IN ('Super Admin', 'District Administrator', 'Municipality Officer');

UPDATE public.profiles 
SET role = 'Department Officer' 
WHERE role IN ('Ward Officer', 'Field Inspector', 'Community Verifier');

-- 2. Drop the old role check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 3. Add the updated role check constraint supporting exactly Citizen, Admin, and Department Officer
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('Citizen', 'Admin', 'Department Officer'));

-- 4. Set Ghorahi as the default municipality for any legacy or newly registered profiles
UPDATE public.profiles 
SET municipality_id = (SELECT id FROM public.municipalities WHERE name = 'Ghorahi Sub-Metropolitan City' LIMIT 1)
WHERE municipality_id IS NULL;

-- 5. Enable missing RLS Write/Insert policies for citizen operations
ALTER TABLE public.report_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public videos read" ON public.report_videos;
CREATE POLICY "Public videos read" ON public.report_videos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert report images" ON public.report_images;
CREATE POLICY "Authenticated users can insert report images" ON public.report_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert report videos" ON public.report_videos;
CREATE POLICY "Authenticated users can insert report videos" ON public.report_videos FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
CREATE POLICY "Authenticated users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert support votes" ON public.support_votes;
CREATE POLICY "Authenticated users can insert support votes" ON public.support_votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete their own support votes" ON public.support_votes;
CREATE POLICY "Authenticated users can delete their own support votes" ON public.support_votes FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- 6. Notifications RLS Policies
DROP POLICY IF EXISTS "Authenticated users can read their own notifications" ON public.notifications;
CREATE POLICY "Authenticated users can read their own notifications" ON public.notifications FOR SELECT USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update their own notifications" ON public.notifications;
CREATE POLICY "Authenticated users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

