-- 1. Add explicit write policies for user_roles table (defense-in-depth)
CREATE POLICY "Only admin can assign roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admin can modify roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admin can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Add database constraints for products table validation
ALTER TABLE public.products
ADD CONSTRAINT name_length CHECK (char_length(name) > 0 AND char_length(name) <= 200);

ALTER TABLE public.products
ADD CONSTRAINT price_positive CHECK (price >= 0 AND price < 1000000);

ALTER TABLE public.products
ADD CONSTRAINT description_length CHECK (description IS NULL OR char_length(description) <= 5000);

-- 3. Improve has_role function with NULL handling
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate input - return false for NULL user_id
  IF _user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- Restrict function access to authenticated users only
REVOKE EXECUTE ON FUNCTION public.has_role FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role TO anon;