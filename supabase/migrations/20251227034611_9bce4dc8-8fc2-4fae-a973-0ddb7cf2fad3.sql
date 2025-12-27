-- Create enum for product categories
CREATE TYPE public.product_category AS ENUM (
  'المواد الأساسية',
  'الزيوت والمعلبات',
  'المشروبات',
  'الألبان والأجبان',
  'الحلويات والشبس',
  'المخبوزات',
  'التنظيف',
  'العناية الشخصية',
  'المجمدات',
  'مستلزمات المنزل',
  'مستلزمات الأطفال'
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category product_category NOT NULL DEFAULT 'المواد الأساسية',
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create store settings table for WhatsApp number
CREATE TABLE public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number TEXT NOT NULL DEFAULT '966500000000',
  store_name TEXT NOT NULL DEFAULT 'متجر عايدة',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default store settings
INSERT INTO public.store_settings (whatsapp_number, store_name) 
VALUES ('966500000000', 'متجر عايدة');

-- Create app_role enum for admin users
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Products: Everyone can read available products
CREATE POLICY "Anyone can view available products"
ON public.products
FOR SELECT
USING (available = true);

-- Products: Admin can view all products
CREATE POLICY "Admin can view all products"
ON public.products
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Products: Only admin can insert
CREATE POLICY "Admin can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Products: Only admin can update
CREATE POLICY "Admin can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Products: Only admin can delete
CREATE POLICY "Admin can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Store settings: Anyone can read
CREATE POLICY "Anyone can read store settings"
ON public.store_settings
FOR SELECT
USING (true);

-- Store settings: Only admin can update
CREATE POLICY "Admin can update store settings"
ON public.store_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- User roles: Admin can view all roles
CREATE POLICY "Admin can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- User roles: Users can view their own role
CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Insert some sample products
INSERT INTO public.products (name, price, category, available, image_url) VALUES
('أرز بسمتي 5 كيلو', 45.00, 'المواد الأساسية', true, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300'),
('زيت زيتون 1 لتر', 35.00, 'الزيوت والمعلبات', true, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300'),
('حليب طازج 1 لتر', 8.00, 'الألبان والأجبان', true, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300'),
('عصير برتقال 1 لتر', 12.00, 'المشروبات', true, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300'),
('شوكولاتة جالكسي', 5.00, 'الحلويات والشبس', true, 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=300'),
('خبز عربي', 3.00, 'المخبوزات', true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300'),
('منظف أرضيات', 15.00, 'التنظيف', true, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300'),
('شامبو', 25.00, 'العناية الشخصية', true, 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=300'),
('دجاج مجمد', 28.00, 'المجمدات', true, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300'),
('طقم أطباق', 65.00, 'مستلزمات المنزل', true, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=300'),
('حفاضات أطفال', 55.00, 'مستلزمات الأطفال', true, 'https://images.unsplash.com/photo-1590005354167-6da97870c757?w=300');