-- Fix Legal Insights RLS Policies
-- This addresses the issue where published insights don't appear for public users

-- First, let's ensure the basic policies are correct
-- Drop existing policies if they exist to recreate them properly
DROP POLICY IF EXISTS "Public can read published insights" ON public.legal_insights;
DROP POLICY IF EXISTS "Anon can read published insights" ON public.legal_insights;
DROP POLICY IF EXISTS "Lawyers can read own insights" ON public.legal_insights;
DROP POLICY IF EXISTS "Active subscribed lawyers can create insights" ON public.legal_insights;
DROP POLICY IF EXISTS "Lawyers can create insights" ON public.legal_insights;
DROP POLICY IF EXISTS "Lawyers can update own insights" ON public.legal_insights;
DROP POLICY IF EXISTS "Lawyers can delete own insights" ON public.legal_insights;

-- IMPORTANT: Allow anonymous users to read published insights
CREATE POLICY "Anyone can read published insights"
    ON public.legal_insights
    FOR SELECT
    TO anon, authenticated
    USING (is_published = true);

-- Lawyers can read their own insights (published or unpublished)
CREATE POLICY "Lawyers can read own insights"
    ON public.legal_insights
    FOR SELECT
    TO authenticated
    USING (auth.uid() = lawyer_id);

-- Active lawyers can create insights (subscription check removed from RLS, handled in application)
-- This is more flexible and allows the application to handle subscription logic
CREATE POLICY "Lawyers can create insights"
    ON public.legal_insights
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = lawyer_id
        AND EXISTS (
            SELECT 1 FROM public.profiles p
            LEFT JOIN public.lawyer_profiles lp ON p.id = lp.id
            WHERE p.id = auth.uid()
                AND p.role = 'lawyer'
                AND lp.status = 'active'
        )
    );

-- Lawyers can update their own insights
CREATE POLICY "Lawyers can update own insights"
    ON public.legal_insights
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = lawyer_id)
    WITH CHECK (auth.uid() = lawyer_id);

-- Lawyers can delete their own insights
CREATE POLICY "Lawyers can delete own insights"
    ON public.legal_insights
    FOR DELETE
    TO authenticated
    USING (auth.uid() = lawyer_id);

-- Ensure the view has proper security
-- The view will now work because the base table allows anon SELECT for published insights

-- Optional: Add an index to improve performance for published insights queries
CREATE INDEX IF NOT EXISTS idx_legal_insights_published_created 
    ON public.legal_insights(is_published, created_at DESC) 
    WHERE is_published = true;

-- Verify grants are correct
GRANT SELECT ON public.legal_insights TO anon;
GRANT SELECT ON public.legal_insights TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.legal_insights TO authenticated;

-- Ensure view grants are correct
GRANT SELECT ON public.legal_insights_with_stats TO anon;
GRANT SELECT ON public.legal_insights_with_stats TO authenticated;

-- Refresh materialized view if needed (views are not materialized by default, so this is just for reference)
-- If you had materialized views, you'd need: REFRESH MATERIALIZED VIEW public.legal_insights_with_stats;

COMMENT ON POLICY "Anyone can read published insights" ON public.legal_insights IS 
'Allows both anonymous and authenticated users to view published insights';

COMMENT ON POLICY "Lawyers can create insights" ON public.legal_insights IS 
'Allows active lawyers to create insights. Subscription check is handled in the application layer for flexibility.';
