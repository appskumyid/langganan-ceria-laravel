
-- Hapus kebijakan keamanan yang ada untuk tabel langganan
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;

-- Buat kebijakan baru yang mengizinkan admin untuk melihat semua langganan
CREATE POLICY "Users can view their own subscriptions, admins can view all"
  ON public.user_subscriptions FOR SELECT
  USING (
    auth.uid() = user_id OR
    public.has_role(auth.uid(), 'admin')
  );

-- Buat kebijakan baru yang mengizinkan admin untuk memperbarui semua langganan
CREATE POLICY "Admins can update any subscription, users can update their own"
  ON public.user_subscriptions FOR UPDATE
  USING (
    auth.uid() = user_id OR
    public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    auth.uid() = user_id OR
    public.has_role(auth.uid(), 'admin')
  );
