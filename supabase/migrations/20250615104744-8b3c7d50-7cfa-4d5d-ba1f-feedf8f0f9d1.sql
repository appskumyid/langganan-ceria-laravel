
-- Allow public read access for payment proofs, which is required for uploads to work correctly with public buckets.
CREATE POLICY "Allow public read access on payment proofs"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'payment_proofs' );
