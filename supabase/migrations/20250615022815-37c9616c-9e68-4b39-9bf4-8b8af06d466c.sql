
-- Create a new table to store product preview sessions
CREATE TABLE public.product_previews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.managed_products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '1 hour') NOT NULL
);

-- Add an index on product_id for faster lookups
CREATE INDEX ON public.product_previews (product_id);

-- Enable Row Level Security
ALTER TABLE public.product_previews ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to read preview records
-- This is necessary so the public preview link works without authentication
CREATE POLICY "Allow public read access to product_previews"
ON public.product_previews FOR SELECT
USING (true);

-- Create a policy to allow admins to create preview records
CREATE POLICY "Allow admin to create product_previews"
ON public.product_previews FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));
