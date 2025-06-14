
-- Add 'category' column to the store_products table
ALTER TABLE public.store_products
ADD COLUMN category TEXT;

-- Enable Row Level Security for store_details to protect user data
ALTER TABLE public.store_details ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view their own store details
CREATE POLICY "Allow users to view their own store details"
ON public.store_details FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow users to insert their own store details
CREATE POLICY "Allow users to insert their own store details"
ON public.store_details FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to update their own store details
CREATE POLICY "Allow users to update their own store details"
ON public.store_details FOR UPDATE
USING (auth.uid() = user_id);

-- Enable Row Level Security for store_products to protect user data
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view their own products
CREATE POLICY "Allow users to view their own products"
ON public.store_products FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow users to insert their own products
CREATE POLICY "Allow users to insert their own products"
ON public.store_products FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to update their own products
CREATE POLICY "Allow users to update their own products"
ON public.store_products FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Allow users to delete their own products
CREATE POLICY "Allow users to delete their own products"
ON public.store_products FOR DELETE
USING (auth.uid() = user_id);
