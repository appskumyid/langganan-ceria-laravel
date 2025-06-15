
-- Create a public storage bucket for payment proofs
insert into storage.buckets
  (id, name, public)
values
  ('payment_proofs', 'payment_proofs', true)
on conflict (id) do nothing;

-- RLS Policies for payment proofs bucket
-- Allow authenticated users to upload files
create policy "Allow authenticated users to upload payment proofs"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'payment_proofs' );

-- Allow users to update their own payment proofs
create policy "Allow users to update their own payment proofs"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'payment_proofs' and owner = auth.uid() );

-- Allow users to delete their own payment proofs
create policy "Allow users to delete their own payment proofs"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'payment_proofs' and owner = auth.uid() );

-- Add columns to user_subscriptions table to store payment proof URL and rejection reason
alter table public.user_subscriptions
add column if not exists payment_proof_url text null;

alter table public.user_subscriptions
add column if not exists rejection_reason text null;
