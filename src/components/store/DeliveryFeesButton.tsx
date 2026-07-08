import { useEffect, useState } from 'react';
import { Truck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/formatPrice';

interface DeliveryFee {
  id: string;
  area_name: string;
  fee: number;
  sort_order: number;
}

export const DeliveryFeesButton = () => {
  const [open, setOpen] = useState(false);
  const [fees, setFees] = useState<DeliveryFee[]>([]);

  useEffect(() => {
    if (!open) return;
    supabase
      .from('delivery_fees')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data) setFees(data as DeliveryFee[]);
      });
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-semibold text-sm"
      >
        <Truck className="w-5 h-5" />
        رسوم توصيل مجانية
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              رسوم التوصيل حسب المنطقة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {fees.length === 0 ? (
              <p className="text-center text-muted-foreground py-6 text-sm">
                لا توجد رسوم توصيل محددة حالياً
              </p>
            ) : (
              fees.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/50 border border-border"
                >
                  <span className="font-semibold text-foreground">{f.area_name}</span>
                  <span className="text-primary font-bold">{formatPrice(f.fee)}</span>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
