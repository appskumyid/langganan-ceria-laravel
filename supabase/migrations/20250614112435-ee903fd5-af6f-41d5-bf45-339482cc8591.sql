
-- Tabel untuk menyimpan langganan pengguna
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_static_id INT NOT NULL, -- Merujuk ke ID produk statis dari frontend
  product_name TEXT NOT NULL,
  product_price TEXT NOT NULL, -- Contoh: "Rp 199.000"
  product_period TEXT NOT NULL, -- Contoh: "/bulan"
  product_category TEXT NOT NULL, -- Contoh: "E-Commerce"
  product_type TEXT NOT NULL, -- Contoh: "Premium", "Non-Premium"
  subscription_status TEXT NOT NULL DEFAULT 'pending_payment', -- status: pending_payment, active, expired, cancelled
  payment_method_selected TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aktifkan Row Level Security
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Kebijakan: Pengguna hanya dapat melihat langganan mereka sendiri
CREATE POLICY "Users can view their own subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Kebijakan: Pengguna dapat membuat langganan untuk diri mereka sendiri
CREATE POLICY "Users can insert their own subscriptions"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  
-- Kebijakan: Pengguna dapat memperbarui langganan mereka sendiri
CREATE POLICY "Users can update their own subscriptions"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tambahkan trigger untuk auto-update updated_at
CREATE TRIGGER handle_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime();

-- Tabel untuk detail toko (khusus E-Commerce non-premium)
CREATE TABLE public.store_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_subscription_id UUID NOT NULL UNIQUE REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Denormalisasi untuk RLS mudah
  store_name TEXT,
  about_store TEXT,
  location TEXT,
  phone_number TEXT,
  store_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aktifkan Row Level Security
ALTER TABLE public.store_details ENABLE ROW LEVEL SECURITY;

-- Kebijakan: Pengguna dapat mengelola detail toko mereka sendiri
CREATE POLICY "Users can manage their own store details"
  ON public.store_details FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tambahkan trigger untuk auto-update updated_at
CREATE TRIGGER handle_store_details_updated_at
  BEFORE UPDATE ON public.store_details
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime();

-- Tabel untuk produk dalam toko (bagian dari store_details)
CREATE TABLE public.store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_details_id UUID NOT NULL REFERENCES public.store_details(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Denormalisasi untuk RLS mudah
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aktifkan Row Level Security
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;

-- Kebijakan: Pengguna dapat mengelola produk di toko mereka sendiri
CREATE POLICY "Users can manage products in their own store"
  ON public.store_products FOR ALL
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.store_details sd WHERE sd.id = store_details_id AND sd.user_id = auth.uid()))
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.store_details sd WHERE sd.id = store_details_id AND sd.user_id = auth.uid()));

-- Tambahkan trigger untuk auto-update updated_at
CREATE TRIGGER handle_store_products_updated_at
  BEFORE UPDATE ON public.store_products
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime();

