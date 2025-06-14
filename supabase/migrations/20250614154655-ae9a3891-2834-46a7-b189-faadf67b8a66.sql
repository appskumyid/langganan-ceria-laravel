
-- Create a public bucket for product images with file size and type limits
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policy for authenticated users to upload to 'product-images' bucket
CREATE POLICY "Allow authenticated uploads to product-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'product-images' );

-- Create RLS policy for public read access on 'product-images' bucket
CREATE POLICY "Allow public read access on product-images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Create RLS policy for owners to update their own files in 'product-images' bucket
CREATE POLICY "Allow owner to update their own files"
ON storage.objects FOR UPDATE
USING ( auth.uid() = owner )
WITH CHECK ( bucket_id = 'product-images' );

-- Create RLS policy for owners to delete their own files in 'product-images' bucket
CREATE POLICY "Allow owner to delete their own files"
ON storage.objects FOR DELETE
USING ( auth.uid() = owner );
