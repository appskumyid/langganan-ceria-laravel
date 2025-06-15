
-- Create a table to store application settings
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comment on table and columns for clarity
COMMENT ON TABLE public.app_settings IS 'Stores key-value pairs for application-wide settings.';
COMMENT ON COLUMN public.app_settings.key IS 'The unique identifier for the setting (e.g., mailchimp_api_key).';
COMMENT ON COLUMN public.app_settings.value IS 'The value of the setting.';

-- Enable Row Level Security
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow admins to perform all actions on settings.
-- It uses the existing has_role() function to check if the user is an admin.
CREATE POLICY "Admins can manage settings"
ON public.app_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger to automatically update the 'updated_at' timestamp on modification.
-- It uses the existing moddatetime() function.
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION moddatetime();
