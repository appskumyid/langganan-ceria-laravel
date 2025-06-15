
-- Create a new table to store manageable services for the services page
CREATE TABLE public.managed_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  category TEXT NOT NULL,
  features TEXT[],
  pricing TEXT,
  duration TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add a trigger to automatically update the 'updated_at' column
CREATE TRIGGER handle_managed_services_updated_at
BEFORE UPDATE ON public.managed_services
FOR EACH ROW
EXECUTE PROCEDURE public.moddatetime();

-- Enable Row Level Security
ALTER TABLE public.managed_services ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access
CREATE POLICY "Allow public read access to managed_services"
ON public.managed_services FOR SELECT
USING (true);

-- Create a policy to allow admins full access
CREATE POLICY "Allow admin full access to managed_services"
ON public.managed_services FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
