-- Supabase SQL Update Script for RLS Policies and Seeding Mock Sandbox Profiles
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Seed the mock profiles in the public.profiles table to allow sandbox user switches to work in Online Mode
INSERT INTO public.profiles (id, name, email, role, reputation_points, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Yogesh Pulami', 'yogi@dang.gov.np', 'Citizen', 120, NOW()),
  ('00000000-0000-0000-0000-000000000002', 'Ghorahi Municipality Admin', 'admin@ghorahimun.gov.np', 'Admin', 0, NOW()),
  ('00000000-0000-0000-0000-000000000003', 'Ramesh Chaudhary (Sanitation)', 'garbage@ghorahimun.demo', 'Department Officer', 0, NOW()),
  ('00000000-0000-0000-0000-000000000004', 'Binod Bhandari (Roads)', 'roads@ghorahimun.demo', 'Department Officer', 0, NOW()),
  ('00000000-0000-0000-0000-000000000005', 'Krishna Raj Oli (Water)', 'water@ghorahimun.demo', 'Department Officer', 0, NOW()),
  ('00000000-0000-0000-0000-000000000006', 'Shyam Sundar Shrestha (Drainage)', 'drainage@ghorahimun.demo', 'Department Officer', 0, NOW()),
  ('00000000-0000-0000-0000-000000000007', 'Hari Prasad Devkota (Electrical)', 'electric@ghorahimun.demo', 'Department Officer', 0, NOW()),
  ('00000000-0000-0000-0000-000000000008', 'Nepal Police Traffic Unit', 'police@ghorahimun.demo', 'Department Officer', 0, NOW()),
  ('00000000-0000-0000-0000-000000000009', 'Nepal Police Security Unit', 'safety@ghorahimun.demo', 'Department Officer', 0, NOW()),
  ('00000000-0000-0000-0000-000000000010', 'Ghorahi Fire Station Command', 'fire@ghorahimun.demo', 'Department Officer', 0, NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- 2. Update RLS policies for reports table
-- Allow anyone (authenticated and anonymous) to SELECT reports so the public feed loads for everyone
DROP POLICY IF EXISTS "Public reports read" ON public.reports;
CREATE POLICY "Public reports read" ON public.reports 
FOR SELECT USING (true);

-- Allow authenticated users to insert as themselves, OR any anonymous client if testing via dev sandbox
DROP POLICY IF EXISTS "Citizens can create reports" ON public.reports;
CREATE POLICY "Citizens can create reports" ON public.reports 
FOR INSERT WITH CHECK (auth.uid() = reporter_id OR auth.uid() IS NULL);

-- Allow updating reports if they are the author, an admin/officer, OR if testing via dev sandbox
DROP POLICY IF EXISTS "Reporters can update their own reports" ON public.reports;
CREATE POLICY "Reporters can update their own reports" ON public.reports 
FOR UPDATE USING (auth.uid() = reporter_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Officers and Admins can manage all reports" ON public.reports;
CREATE POLICY "Officers and Admins can manage all reports" ON public.reports 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('Admin', 'Department Officer')
  ) OR auth.uid() IS NULL
);

-- 3. Update RLS policies for comments table
-- Allow anyone to read comments
DROP POLICY IF EXISTS "Public comments read" ON public.comments;
CREATE POLICY "Public comments read" ON public.comments 
FOR SELECT USING (true);

-- Allow inserts if they are themselves, OR if testing via dev sandbox
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
CREATE POLICY "Authenticated users can insert comments" ON public.comments 
FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- 4. Update RLS policies for support_votes table
-- Allow anyone to read support_votes (critical fix: missing select policy caused votes to fail to render)
DROP POLICY IF EXISTS "Public support_votes read" ON public.support_votes;
CREATE POLICY "Public support_votes read" ON public.support_votes 
FOR SELECT USING (true);

-- Allow votes insertion
DROP POLICY IF EXISTS "Authenticated users can insert support votes" ON public.support_votes;
CREATE POLICY "Authenticated users can insert support votes" ON public.support_votes 
FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Allow votes deletion
DROP POLICY IF EXISTS "Authenticated users can delete their own support votes" ON public.support_votes;
CREATE POLICY "Authenticated users can delete their own support votes" ON public.support_votes 
FOR DELETE USING (auth.uid() = user_id OR auth.uid() IS NULL);
