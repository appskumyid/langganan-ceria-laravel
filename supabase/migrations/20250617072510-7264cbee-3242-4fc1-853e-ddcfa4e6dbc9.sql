
-- Add new settings for footer and banner configuration
INSERT INTO public.app_settings (key, value) VALUES 
('footer_address', 'Alamat perusahaan akan ditampilkan di sini'),
('footer_phone', '+62 123 456 7890'),
('footer_instagram_url', 'https://instagram.com/perusahaan'),
('footer_youtube_url', 'https://youtube.com/@perusahaan'),
('footer_tiktok_url', 'https://tiktok.com/@perusahaan'),
('banner_image_1', 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'),
('banner_image_2', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'),
('banner_image_3', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')
ON CONFLICT (key) DO UPDATE SET 
value = EXCLUDED.value,
updated_at = now();
