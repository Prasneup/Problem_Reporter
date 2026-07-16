-- SQL script to create community suggestions, upvotes, and comments tables

-- 1. Create Suggestions Table
CREATE TABLE IF NOT EXISTS public.community_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    upvotes INTEGER DEFAULT 1,
    author_name VARCHAR(150) NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Upvotes Table to track unique votes
CREATE TABLE IF NOT EXISTS public.community_upvotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    suggestion_id UUID REFERENCES public.community_suggestions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (suggestion_id, user_id)
);

-- 3. Create Comments Table
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    suggestion_id UUID REFERENCES public.community_suggestions(id) ON DELETE CASCADE,
    author_name VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.community_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- 5. Set RLS Policies
CREATE POLICY "Public suggestions read" ON public.community_suggestions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert suggestions" ON public.community_suggestions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update suggestions" ON public.community_suggestions FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Public upvotes read" ON public.community_upvotes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert upvotes" ON public.community_upvotes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete their own upvotes" ON public.community_upvotes FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Public comments read" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert comments" ON public.community_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
