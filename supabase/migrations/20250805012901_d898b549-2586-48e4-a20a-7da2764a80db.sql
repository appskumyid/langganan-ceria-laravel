-- Create domains table for user domain management
CREATE TABLE public.domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain_name)
);

-- Enable RLS
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own domains" 
ON public.domains 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to ensure only one domain is enabled per user
CREATE OR REPLACE FUNCTION public.ensure_single_enabled_domain()
RETURNS TRIGGER AS $$
BEGIN
  -- If this domain is being enabled, disable all other domains for this user
  IF NEW.is_enabled = true THEN
    UPDATE public.domains 
    SET is_enabled = false 
    WHERE user_id = NEW.user_id 
    AND id != NEW.id 
    AND is_enabled = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for the function
CREATE TRIGGER ensure_single_enabled_domain_trigger
  BEFORE INSERT OR UPDATE ON public.domains
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_enabled_domain();