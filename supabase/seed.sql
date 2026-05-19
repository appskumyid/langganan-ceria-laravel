-- =============================================================================
-- SEED DATA
-- Dijalankan otomatis oleh Postgres container saat pertama kali start
-- (di-mount via docker-compose ke /docker-entrypoint-initdb.d/seed.sql).
--
-- Semua INSERT memakai ON CONFLICT DO NOTHING agar idempotent — aman bila
-- dijalankan ulang atau bila migrasi sudah meng-insert sebagian data.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. APP SETTINGS (branding, banner, popup, kontak, footer, mailchimp)
-- -----------------------------------------------------------------------------
INSERT INTO public.app_settings (key, value) VALUES
  ('company_name', 'KSAinovasi'),
  ('banner_image_1', 'https://plus.unsplash.com/premium_photo-1661963212517-830bbb7d76fc?ixlib=rb-4.1.0&fm=jpg&q=60&w=3000'),
  ('banner_image_2', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=2070&q=80'),
  ('banner_image_3', 'https://t4.ftcdn.net/jpg/02/72/31/41/360_F_272314124_oVQMMZWHwOPYsmCASwjRcFuZhSa4jqzO.jpg'),
  ('popup_enabled', 'true'),
  ('popup_title', 'KSAInovasi'),
  ('popup_image_url', 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=2340&q=80'),
  ('popup_content', E'Kami menyediakan layanan sewa dan penjualan website profesional untuk berbagai kebutuhan, mulai dari company profile, undangan online, hingga e-commerce — cukup 10 menit jadi!\n\nDilengkapi dengan sistem keamanan berstandar tinggi dan infrastruktur server yang handal.\n\n🔹 Website Instan & Kustomisasi Mudah\n🔹 Proteksi Keamanan Data\n🔹 Infrastruktur Cloud & Server Modern\n🔹 Cocok untuk UMKM, Startup, hingga Perusahaan Besar'),
  ('contact_address', 'Jl. Contoh No. 123, Kota Contoh, 12345'),
  ('contact_whatsapp_number', '6287886425562'),
  ('contact_maps_latitude', '-6.2088'),
  ('contact_maps_longitude', '106.8456'),
  ('contact_maps_embed_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.8425641!3d-6.2087634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5390917b759%3A0x6b45e67356080477!2sMonas!5e0!3m2!1sen!2sid!4v1234567890123!5m2!1sen!2sid'),
  ('footer_address', 'Alamat perusahaan akan ditampilkan di sini'),
  ('footer_phone', '+62 123 456 7890'),
  ('footer_instagram_url', 'https://instagram.com/perusahaan'),
  ('footer_youtube_url', 'https://youtube.com/@perusahaan'),
  ('footer_tiktok_url', 'https://tiktok.com/@perusahaan'),
  ('mailchimp_api_key', ''),
  ('mailchimp_list_id', '')
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. PRODUCT CATEGORIES
-- -----------------------------------------------------------------------------
INSERT INTO public.product_categories (name, description, domain_name) VALUES
  ('Company Profile',  'Template profil perusahaan untuk membangun citra bisnis yang profesional', 'ksainovasi.com'),
  ('E-Commerce',       'Template toko online untuk menjual produk secara digital',                  'ksainovasi.com'),
  ('Undangan Digital', 'Template undangan digital untuk berbagai acara dan perayaan',               'undanganku.my.id'),
  ('Aplikasi Bisnis (ERP, POS, LMS, dll)', 'Aplikasi bisnis lengkap seperti ERP, Point of Sale, Learning Management System dan sistem bisnis lainnya', NULL)
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. MANAGED PRODUCTS (contoh awal — admin bisa menambah lewat dashboard)
-- -----------------------------------------------------------------------------
INSERT INTO public.managed_products (name, description, category, type, image_url, demo_url, features, pricing, subscription_periods) VALUES
  (
    'Company Profile Starter',
    'Website company profile siap pakai untuk UMKM dan perusahaan kecil.',
    'Company Profile',
    'Non-Premium',
    'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=2340&q=80',
    'https://demo.foodappi.xyz/',
    ARRAY['Responsive Design','SEO Friendly','Halaman About','Halaman Layanan','Form Kontak'],
    '{"monthly":"Rp 99.000","quarterly":"Rp 270.000","semiAnnual":"Rp 510.000","yearly":"Rp 990.000"}'::jsonb,
    '["monthly","quarterly","semiAnnual","yearly"]'::jsonb
  ),
  (
    'E-Commerce Basic',
    'Toko online standar dengan katalog produk dan checkout sederhana.',
    'E-Commerce',
    'Non-Premium',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=2340&q=80',
    'https://demo.foodappi.xyz/',
    ARRAY['Katalog Produk','Keranjang Belanja','Multi-payment','SEO Tools'],
    '{"monthly":"Rp 149.000","quarterly":"Rp 400.000","semiAnnual":"Rp 750.000","yearly":"Rp 1.400.000"}'::jsonb,
    '["monthly","quarterly","semiAnnual","yearly"]'::jsonb
  ),
  (
    'Undangan Digital Elegant',
    'Kartu undangan digital dengan tema elegan dan fitur RSVP.',
    'Undangan Digital',
    'Non-Premium',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=2340&q=80',
    'https://demo.foodappi.xyz/',
    ARRAY['RSVP Online','Galeri Foto','Countdown Timer','Maps Lokasi'],
    '{"monthly":"Rp 50.000","quarterly":"Rp 120.000","semiAnnual":"Rp 200.000","yearly":"Rp 350.000"}'::jsonb,
    '["monthly","quarterly","semiAnnual","yearly"]'::jsonb
  ),
  (
    'ERP Premium',
    'Sistem ERP untuk mengelola operasional bisnis end-to-end.',
    'Aplikasi Bisnis (ERP, POS, LMS, dll)',
    'Premium',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=2340&q=80',
    'https://demo.foodappi.xyz/',
    ARRAY['Inventory','Accounting','HRD','Advanced Analytics'],
    '{"monthly":"Rp 499.000","quarterly":"Rp 1.350.000","semiAnnual":"Rp 2.500.000","yearly":"Rp 4.800.000"}'::jsonb,
    '["monthly","quarterly","semiAnnual","yearly"]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. MANAGED SERVICES (contoh awal)
-- -----------------------------------------------------------------------------
INSERT INTO public.managed_services (name, description, category, features, duration, pricing, icon_name) VALUES
  (
    'Setup Server VPS',
    'Instalasi & konfigurasi server VPS lengkap dengan keamanan dasar.',
    'infrastructure',
    ARRAY['Hardening SSH','Firewall','SSL Let''s Encrypt','Backup Otomatis'],
    '3 hari',
    'Rp 750.000',
    'Server'
  ),
  (
    'Audit Keamanan Website',
    'Pemeriksaan menyeluruh untuk celah keamanan pada website Anda.',
    'security',
    ARRAY['Vulnerability Scan','Report PDF','Rekomendasi Perbaikan'],
    '5 hari',
    'Rp 1.500.000',
    'ShieldCheck'
  ),
  (
    'Custom Development',
    'Pengembangan fitur khusus sesuai kebutuhan bisnis Anda.',
    'development',
    ARRAY['Konsultasi','UI/UX','Coding','Deployment'],
    'Negosiasi',
    'please contact',
    'Code'
  )
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- CATATAN PENTING
-- -----------------------------------------------------------------------------
-- 1) Tabel `profiles`, `user_roles`, dan `user_subscriptions` TIDAK di-seed
--    karena bergantung pada user di `auth.users` yang dibuat lewat Supabase Auth.
--
-- 2) Untuk mempromosikan user pertama menjadi admin (setelah register):
--      UPDATE public.user_roles
--      SET    role = 'admin'
--      WHERE  user_id = (SELECT id FROM auth.users WHERE email = 'you@example.com');
-- =============================================================================
