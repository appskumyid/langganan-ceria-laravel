
-- Add subscription periods column to managed_products table
ALTER TABLE public.managed_products 
ADD COLUMN subscription_periods jsonb DEFAULT '["monthly"]'::jsonb;

-- Add subscription periods column to products table  
ALTER TABLE public.products
ADD COLUMN subscription_periods jsonb DEFAULT '["monthly"]'::jsonb;

-- Update existing products with default monthly subscription
UPDATE public.managed_products 
SET subscription_periods = '["monthly"]'::jsonb 
WHERE subscription_periods IS NULL;

UPDATE public.products
SET subscription_periods = '["monthly"]'::jsonb
WHERE subscription_periods IS NULL;
