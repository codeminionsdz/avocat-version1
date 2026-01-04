-- ============================================
-- Normalize Subscription Pricing to 15,000 DZD Annual Only
-- ============================================
-- This migration enforces the final pricing model:
-- - Single plan: Annual only (15,000 DZD/year)
-- - Removes monthly and quarterly options
-- - Adds database-level validation for amount

-- Step 1: Update any existing subscriptions to annual plan FIRST
-- (Must happen before adding new constraints)
UPDATE public.subscriptions 
SET plan = 'annual'
WHERE plan IN ('monthly', 'quarterly');

-- Step 2: Update any subscriptions with old pricing FIRST
UPDATE public.subscriptions 
SET amount = 15000
WHERE amount != 15000;

-- Step 3: Drop the old plan constraint
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

-- Step 4: Add new plan constraint (annual only)
ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_plan_check 
CHECK (plan IN ('annual'));

-- Step 5: Add amount validation (must be 15000)
ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_amount_check 
CHECK (amount = 15000);

-- Note: Existing active subscriptions will remain active until their end date
-- New subscriptions must follow the 15,000 DZD annual model
