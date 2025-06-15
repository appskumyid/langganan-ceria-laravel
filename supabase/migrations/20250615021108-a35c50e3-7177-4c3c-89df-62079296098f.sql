
-- Create a new table to store product files
CREATE TABLE public.product_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.managed_products(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  html_content TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add a trigger to automatically update the 'updated_at' column
CREATE TRIGGER handle_product_files_updated_at
BEFORE UPDATE ON public.product_files
FOR EACH ROW
EXECUTE PROCEDURE public.moddatetime();

-- Enable Row Level Security
ALTER TABLE public.product_files ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow admins full access to product files
CREATE POLICY "Allow admin full access to product_files"
ON public.product_files FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
