
-- Add new columns for office phone number and maps URL to company_profiles table
ALTER TABLE public.company_profiles ADD COLUMN office_phone_number TEXT;
ALTER TABLE public.company_profiles ADD COLUMN maps_url TEXT;
