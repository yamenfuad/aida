-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('aida-img', 'aida-img', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to product images
CREATE POLICY "Public can view product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'aida-img');

-- Allow admin to upload product images
CREATE POLICY "Admin can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'aida-img' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admin to update product images
CREATE POLICY "Admin can update product images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'aida-img' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admin to delete product images
CREATE POLICY "Admin can delete product images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'aida-img' AND has_role(auth.uid(), 'admin'::app_role));

-- Add description column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS description text;