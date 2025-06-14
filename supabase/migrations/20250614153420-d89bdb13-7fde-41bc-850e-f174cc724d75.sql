
-- Alter tabel store_details untuk menambahkan kolom link media sosial
ALTER TABLE public.store_details ADD COLUMN instagram_url TEXT;
ALTER TABLE public.store_details ADD COLUMN youtube_url TEXT;
ALTER TABLE public.store_details ADD COLUMN facebook_url TEXT;
ALTER TABLE public.store_details ADD COLUMN linkedin_url TEXT;

-- Buat tabel untuk Company Profiles
CREATE TABLE public.company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_subscription_id UUID NOT NULL UNIQUE REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  about TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  address TEXT NOT NULL,
  instagram_url TEXT,
  youtube_url TEXT,
  facebook_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aktifkan RLS dan trigger untuk Company Profiles
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own company profiles" ON public.company_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER handle_company_profiles_updated_at BEFORE UPDATE ON public.company_profiles FOR EACH ROW EXECUTE FUNCTION moddatetime();

-- Buat tabel untuk layanan/produk dari Company Profile
CREATE TABLE public.company_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_profile_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aktifkan RLS dan trigger untuk Company Services
ALTER TABLE public.company_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage services in their own company profile" ON public.company_services FOR ALL 
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.company_profiles cp WHERE cp.id = company_profile_id AND cp.user_id = auth.uid()))
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.company_profiles cp WHERE cp.id = company_profile_id AND cp.user_id = auth.uid()));
CREATE TRIGGER handle_company_services_updated_at BEFORE UPDATE ON public.company_services FOR EACH ROW EXECUTE FUNCTION moddatetime();

-- Buat tabel untuk CV/Portfolios
CREATE TABLE public.cv_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_subscription_id UUID NOT NULL UNIQUE REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  skills TEXT,
  phone_number TEXT NOT NULL,
  address TEXT NOT NULL,
  instagram_url TEXT,
  youtube_url TEXT,
  facebook_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aktifkan RLS dan trigger untuk CV/Portfolios
ALTER TABLE public.cv_portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own CVs" ON public.cv_portfolios FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER handle_cv_portfolios_updated_at BEFORE UPDATE ON public.cv_portfolios FOR EACH ROW EXECUTE FUNCTION moddatetime();

-- Buat tabel untuk Pengalaman Kerja (Work Experiences)
CREATE TABLE public.work_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_portfolio_id UUID NOT NULL REFERENCES public.cv_portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_period TEXT NOT NULL,
  job_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aktifkan RLS dan trigger untuk Work Experiences
ALTER TABLE public.work_experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own work experiences" ON public.work_experiences FOR ALL 
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.cv_portfolios cvp WHERE cvp.id = cv_portfolio_id AND cvp.user_id = auth.uid()))
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.cv_portfolios cvp WHERE cvp.id = cv_portfolio_id AND cvp.user_id = auth.uid()));
CREATE TRIGGER handle_work_experiences_updated_at BEFORE UPDATE ON public.work_experiences FOR EACH ROW EXECUTE FUNCTION moddatetime();

-- Buat tabel untuk Undangan Digital
CREATE TABLE public.digital_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_subscription_id UUID NOT NULL UNIQUE REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  groom_name TEXT NOT NULL,
  bride_name TEXT NOT NULL,
  ceremony_date DATE NOT NULL,
  ceremony_time TIME WITHOUT TIME ZONE NOT NULL,
  ceremony_location TEXT NOT NULL,
  reception_date DATE,
  reception_time TIME WITHOUT TIME ZONE,
  reception_location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aktifkan RLS dan trigger untuk Digital Invitations
ALTER TABLE public.digital_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own invitations" ON public.digital_invitations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER handle_digital_invitations_updated_at BEFORE UPDATE ON public.digital_invitations FOR EACH ROW EXECUTE FUNCTION moddatetime();
