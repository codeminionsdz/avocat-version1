-- Legal Insights System
-- Professional legal content for lawyer profiles

-- Create legal_insights table
CREATE TABLE IF NOT EXISTS public.legal_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lawyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'criminal',
        'family',
        'civil',
        'commercial',
        'administrative',
        'labor',
        'real_estate',
        'intellectual_property',
        'tax',
        'other'
    )),
    ai_tags TEXT[] DEFAULT '{}',
    quality_score FLOAT DEFAULT 0.5 CHECK (quality_score >= 0 AND quality_score <= 1),
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT title_length CHECK (char_length(title) >= 10 AND char_length(title) <= 200),
    CONSTRAINT content_length CHECK (char_length(content) >= 100 AND char_length(content) <= 5000)
);

-- Create legal_insight_ratings table
CREATE TABLE IF NOT EXISTS public.legal_insight_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insight_id UUID NOT NULL REFERENCES public.legal_insights(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating TEXT NOT NULL CHECK (rating IN ('helpful', 'not_helpful')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One rating per user per insight
    UNIQUE(insight_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_legal_insights_lawyer_id ON public.legal_insights(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_legal_insights_category ON public.legal_insights(category);
CREATE INDEX IF NOT EXISTS idx_legal_insights_is_published ON public.legal_insights(is_published);
CREATE INDEX IF NOT EXISTS idx_legal_insights_created_at ON public.legal_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_legal_insight_ratings_insight_id ON public.legal_insight_ratings(insight_id);
CREATE INDEX IF NOT EXISTS idx_legal_insight_ratings_user_id ON public.legal_insight_ratings(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_legal_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_legal_insights_updated_at
    BEFORE UPDATE ON public.legal_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_legal_insights_updated_at();

-- Row Level Security Policies

-- Enable RLS
ALTER TABLE public.legal_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_insight_ratings ENABLE ROW LEVEL SECURITY;

-- Legal Insights Policies

-- Anyone can read published insights
CREATE POLICY "Public can read published insights"
    ON public.legal_insights
    FOR SELECT
    USING (is_published = true);

-- Lawyers can read their own insights (published or unpublished)
CREATE POLICY "Lawyers can read own insights"
    ON public.legal_insights
    FOR SELECT
    USING (auth.uid() = lawyer_id);

-- Only active subscribed lawyers can create insights
CREATE POLICY "Active subscribed lawyers can create insights"
    ON public.legal_insights
    FOR INSERT
    WITH CHECK (
        auth.uid() = lawyer_id
        AND EXISTS (
            SELECT 1 FROM public.profiles p
            LEFT JOIN public.lawyer_profiles lp ON p.id = lp.id
            LEFT JOIN public.subscriptions s ON p.id = s.lawyer_id
            WHERE p.id = auth.uid()
                AND p.role = 'lawyer'
                AND lp.status = 'active'
                AND s.status = 'active'
                AND s.ends_at > NOW()
        )
    );

-- Lawyers can update their own insights
CREATE POLICY "Lawyers can update own insights"
    ON public.legal_insights
    FOR UPDATE
    USING (auth.uid() = lawyer_id)
    WITH CHECK (auth.uid() = lawyer_id);

-- Lawyers can delete their own insights
CREATE POLICY "Lawyers can delete own insights"
    ON public.legal_insights
    FOR DELETE
    USING (auth.uid() = lawyer_id);

-- Legal Insight Ratings Policies

-- Authenticated users can read ratings
CREATE POLICY "Authenticated users can read ratings"
    ON public.legal_insight_ratings
    FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated users can rate insights
CREATE POLICY "Authenticated users can rate insights"
    ON public.legal_insight_ratings
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings"
    ON public.legal_insight_ratings
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete own ratings"
    ON public.legal_insight_ratings
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create view for insights with statistics
CREATE OR REPLACE VIEW public.legal_insights_with_stats AS
SELECT 
    li.*,
    p.full_name as lawyer_name,
    lp.specialties as specialization,
    p.city as wilaya,
    COALESCE(helpful_count, 0) as helpful_count,
    COALESCE(not_helpful_count, 0) as not_helpful_count,
    COALESCE(helpful_count, 0) + COALESCE(not_helpful_count, 0) as total_ratings
FROM public.legal_insights li
JOIN public.profiles p ON li.lawyer_id = p.id
LEFT JOIN public.lawyer_profiles lp ON li.lawyer_id = lp.id
LEFT JOIN (
    SELECT 
        insight_id,
        COUNT(*) FILTER (WHERE rating = 'helpful') as helpful_count,
        COUNT(*) FILTER (WHERE rating = 'not_helpful') as not_helpful_count
    FROM public.legal_insight_ratings
    GROUP BY insight_id
) ratings ON li.id = ratings.insight_id;

-- Grant permissions
GRANT SELECT ON public.legal_insights_with_stats TO authenticated;
GRANT SELECT ON public.legal_insights_with_stats TO anon;
