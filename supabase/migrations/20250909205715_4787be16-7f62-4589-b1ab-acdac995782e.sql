-- Add user_id column to deploy_configs for user ownership
ALTER TABLE public.deploy_configs 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update existing rows to have a user_id (set to null for now, admins will need to assign)
-- Note: Existing configs will need manual assignment of user_id

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.deploy_configs;

-- Create secure policies for deploy_configs
CREATE POLICY "Users can view their own deploy configs" 
ON public.deploy_configs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deploy configs" 
ON public.deploy_configs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deploy configs" 
ON public.deploy_configs 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deploy configs" 
ON public.deploy_configs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow admins to manage all deploy configs
CREATE POLICY "Admins can manage all deploy configs" 
ON public.deploy_configs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role)) 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));