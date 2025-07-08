-- Add enabled column to store_products table
ALTER TABLE public.store_products 
ADD COLUMN enabled boolean NOT NULL DEFAULT true;