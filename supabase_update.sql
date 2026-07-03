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
