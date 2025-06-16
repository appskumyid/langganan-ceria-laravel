
-- Create a new table to store generated files for each user subscription
CREATE TABLE public.user_generated_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_subscription_id UUID NOT NULL REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  html_content TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add a trigger to automatically update the 'updated_at' column
CREATE TRIGGER handle_user_generated_files_updated_at
BEFORE UPDATE ON public.user_generated_files
FOR EACH ROW
EXECUTE PROCEDURE public.moddatetime();

-- Enable Row Level Security
ALTER TABLE public.user_generated_files ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to read their own generated files
-- This might be useful for future features where users can preview their site
CREATE POLICY "Allow user read access to their own generated files"
ON public.user_generated_files FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.user_subscriptions us
    WHERE us.id = user_subscription_id AND us.user_id = auth.uid()
));

-- Create a policy to allow admins full access
CREATE POLICY "Allow admin full access to user_generated_files"
ON public.user_generated_files FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add a unique constraint to prevent duplicate files for the same subscription
-- This is important for the upsert logic to work correctly
ALTER TABLE public.user_generated_files
ADD CONSTRAINT user_generated_files_subscription_id_file_name_key
UNIQUE (user_subscription_id, file_name);
