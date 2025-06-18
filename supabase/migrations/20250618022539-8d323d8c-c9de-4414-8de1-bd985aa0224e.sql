
-- Add new settings for contact page configuration
INSERT INTO public.app_settings (key, value) VALUES 
('company_name', 'KSAinovasi'),
('contact_whatsapp_number', '6287886425562'),
('contact_address', 'Jl. Contoh No. 123, Kota Contoh, 12345'),
('contact_maps_latitude', '-6.2088'),
('contact_maps_longitude', '106.8456'),
('contact_maps_embed_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.8425641!3d-6.2087634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5390917b759%3A0x6b45e67356080477!2sMonas!5e0!3m2!1sen!2sid!4v1234567890123!5m2!1sen!2sid')
ON CONFLICT (key) DO UPDATE SET 
value = EXCLUDED.value,
updated_at = now();
