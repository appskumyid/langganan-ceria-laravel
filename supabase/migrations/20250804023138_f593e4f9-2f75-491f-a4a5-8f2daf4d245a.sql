-- Add subdomain field to user_subscriptions table
ALTER TABLE public.user_subscriptions 
ADD COLUMN subdomain text;

-- Add index for subdomain lookup
CREATE INDEX idx_user_subscriptions_subdomain ON public.user_subscriptions(subdomain);

-- Create table for deployment status tracking
CREATE TABLE public.deployment_status (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id uuid NOT NULL REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  subdomain text NOT NULL,
  status text NOT NULL DEFAULT 'preparing',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on deployment_status
ALTER TABLE public.deployment_status ENABLE ROW LEVEL SECURITY;

-- Create policies for deployment_status
CREATE POLICY "Users can view their own deployment status" 
ON public.deployment_status 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM public.user_subscriptions us 
  WHERE us.id = deployment_status.subscription_id 
  AND us.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own deployment status" 
ON public.deployment_status 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 
  FROM public.user_subscriptions us 
  WHERE us.id = deployment_status.subscription_id 
  AND us.user_id = auth.uid()
));

-- Add trigger for updated_at
CREATE TRIGGER update_deployment_status_updated_at
BEFORE UPDATE ON public.deployment_status
FOR EACH ROW
EXECUTE FUNCTION public.moddatetime();