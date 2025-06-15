
-- Create a new table to store products from the admin page
CREATE TABLE public.managed_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type public.product_type_enum NOT NULL,
  category TEXT NOT NULL,
  pricing JSONB NOT NULL,
  image_url TEXT,
  features TEXT[],
  demo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add a trigger to automatically update the 'updated_at' column
CREATE TRIGGER handle_managed_products_updated_at
BEFORE UPDATE ON public.managed_products
FOR EACH ROW
EXECUTE PROCEDURE public.moddatetime();

-- Enable Row Level Security
ALTER TABLE public.managed_products ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow admins full access to the products
CREATE POLICY "Allow admin full access to managed_products"
ON public.managed_products FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
