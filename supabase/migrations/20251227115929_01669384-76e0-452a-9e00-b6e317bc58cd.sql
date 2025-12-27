-- Add app_download_url column to store_settings
ALTER TABLE public.store_settings 
ADD COLUMN app_download_url text DEFAULT '';