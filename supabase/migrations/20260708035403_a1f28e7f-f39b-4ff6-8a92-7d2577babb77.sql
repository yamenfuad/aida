CREATE TABLE public.delivery_fees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area_name text NOT NULL,
  fee numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.delivery_fees TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_fees TO authenticated;
GRANT ALL ON public.delivery_fees TO service_role;

ALTER TABLE public.delivery_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view delivery fees" ON public.delivery_fees FOR SELECT USING (true);
CREATE POLICY "Admin can insert delivery fees" ON public.delivery_fees FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can update delivery fees" ON public.delivery_fees FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can delete delivery fees" ON public.delivery_fees FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));