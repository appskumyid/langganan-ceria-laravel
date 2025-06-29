
-- Create product_type enum
CREATE TYPE public.product_type_enum AS ENUM ('Premium', 'Non-Premium');

-- Create products table
CREATE TABLE public.products (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type product_type_enum NOT NULL,
  category TEXT NOT NULL,
  price TEXT NOT NULL,
  period TEXT NOT NULL,
  image_url TEXT,
  features TEXT[],
  demo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Allow public read access to products"
ON public.products FOR SELECT
USING (true);

-- Policy: Allow admin to manage products
CREATE POLICY "Allow admin full access to products"
ON public.products FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert initial data from productsData
INSERT INTO public.products (id, name, description, type, category, price, period, image_url, features, demo_url)
VALUES
  (1, 'Toko Online Basic', 'Platform e-commerce sederhana untuk bisnis kecil', 'Non-Premium', 'E-Commerce', 'Rp 199.000', '/bulan', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80', '{"Katalog Produk", "Keranjang Belanja", "Payment Gateway", "Dashboard Admin"}', 'https://demo.example.com/ecommerce-basic'),
  (2, 'Toko Online Premium', 'E-commerce lengkap dengan fitur advanced dan analitik', 'Premium', 'E-Commerce', 'Rp 599.000', '/bulan', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80', '{"Multi-vendor", "Advanced Analytics", "SEO Tools", "Multi-payment", "Mobile App"}', 'https://demo.example.com/ecommerce-premium'),
  (3, 'Company Profile Standard', 'Website profil perusahaan yang profesional', 'Non-Premium', 'Company Profile', 'Rp 99.000', '/bulan', 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80', '{"Responsive Design", "Company Info", "Contact Form", "Gallery"}', 'https://demo.example.com/company-basic'),
  (4, 'Company Profile Premium', 'Website perusahaan dengan fitur lengkap dan animasi', 'Premium', 'Company Profile', 'Rp 299.000', '/bulan', 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80', '{"Custom Animation", "Blog System", "Team Management", "Newsletter", "SEO Optimized"}', 'https://demo.example.com/company-premium'),
  (5, 'Portfolio Personal', 'Website portfolio untuk freelancer dan profesional', 'Non-Premium', 'CV / Portfolio', 'Rp 79.000', '/bulan', 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80', '{"Portfolio Gallery", "CV Online", "Contact Form", "Skills Section"}', 'https://demo.example.com/portfolio-basic'),
  (6, 'Undangan Digital Premium', 'Undangan pernikahan digital yang elegan dan interaktif', 'Premium', 'Undangan Digital', 'Rp 149.000', '/sekali', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80', '{"Custom Design", "RSVP Online", "Gallery Photo", "Music Background", "Guest Book"}', 'https://demo.example.com/invitation'),
  (7, 'POS System Basic', 'Sistem Point of Sale untuk retail dan restoran', 'Non-Premium', 'Aplikasi Bisnis (ERP, POS, LMS, dll)', 'Rp 399.000', '/bulan', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80', '{"Inventory Management", "Sales Reporting", "Barcode Scanner", "Multi-user"}', 'https://demo.example.com/pos-basic'),
  (8, 'ERP Enterprise', 'Sistem ERP lengkap untuk perusahaan besar', 'Premium', 'Aplikasi Bisnis (ERP, POS, LMS, dll)', 'Rp 1.999.000', '/bulan', 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80', '{"HR Management", "Finance Module", "CRM Integration", "Custom Reports", "API Access"}', 'https://demo.example.com/erp-enterprise');

-- Alter 'id' column to be an auto-incrementing identity column
ALTER TABLE public.products
  ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (START WITH 9);

