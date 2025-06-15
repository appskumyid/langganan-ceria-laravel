
-- Enable Row Level Security on managed_products table
ALTER TABLE public.managed_products ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to all managed_products
CREATE POLICY "Allow public read access to managed_products"
ON public.managed_products
FOR SELECT
USING (true);
