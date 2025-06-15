
-- Allow admins to view and manage subscription-related data for all users.

-- store_details: For E-Commerce products
DROP POLICY IF EXISTS "Users can manage their own store details" ON public.store_details;
CREATE POLICY "Allow full access for users and admins on store_details"
ON public.store_details FOR ALL
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- store_products: For E-Commerce products
DROP POLICY IF EXISTS "Users can manage products in their own store" ON public.store_products;
CREATE POLICY "Allow full access for users and admins on store_products"
ON public.store_products FOR ALL
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- company_profiles: For Company Profile products
DROP POLICY IF EXISTS "Users can manage their own company profiles" ON public.company_profiles;
CREATE POLICY "Allow full access for users and admins on company_profiles"
ON public.company_profiles FOR ALL
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- company_services: For Company Profile products
DROP POLICY IF EXISTS "Users can manage their own company services" ON public.company_services;
CREATE POLICY "Allow full access for users and admins on company_services"
ON public.company_services FOR ALL
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- cv_portfolios: For CV/Portfolio products
DROP POLICY IF EXISTS "Users can manage their own cv portfolios" ON public.cv_portfolios;
CREATE POLICY "Allow full access for users and admins on cv_portfolios"
ON public.cv_portfolios FOR ALL
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- work_experiences: For CV/Portfolio products
DROP POLICY IF EXISTS "Users can manage their own work experiences" ON public.work_experiences;
CREATE POLICY "Allow full access for users and admins on work_experiences"
ON public.work_experiences FOR ALL
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- digital_invitations: For Digital Invitation products
DROP POLICY IF EXISTS "Users can manage their own digital invitations" ON public.digital_invitations;
CREATE POLICY "Allow full access for users and admins on digital_invitations"
ON public.digital_invitations FOR ALL
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
