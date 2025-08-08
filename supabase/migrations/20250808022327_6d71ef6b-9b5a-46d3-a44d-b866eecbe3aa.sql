-- Insert categories from managed_products into product_categories
INSERT INTO product_categories (name, description) 
VALUES 
  ('Company Profile', 'Template profil perusahaan untuk membangun citra bisnis yang profesional'),
  ('E-Commerce', 'Template toko online untuk menjual produk secara digital'),
  ('Undangan Digital', 'Template undangan digital untuk berbagai acara dan perayaan'),
  ('Aplikasi Bisnis (ERP, POS, LMS, dll)', 'Aplikasi bisnis lengkap seperti ERP, Point of Sale, Learning Management System dan sistem bisnis lainnya')
ON CONFLICT (name) DO NOTHING;