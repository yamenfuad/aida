import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Truck } from 'lucide-react';

interface DeliveryFee {
  id: string;
  area_name: string;
  fee: number;
  sort_order: number;
}

export const DeliveryFeesManager = () => {
  const [fees, setFees] = useState<DeliveryFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newArea, setNewArea] = useState('');
  const [newFee, setNewFee] = useState('');

  const fetchFees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('delivery_fees')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) setFees(data as DeliveryFee[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleAdd = async () => {
    if (!newArea.trim() || !newFee) {
      toast({ title: 'خطأ', description: 'الرجاء إدخال اسم المنطقة والرسوم', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const maxOrder = fees.reduce((m, f) => Math.max(m, f.sort_order), 0);
    const { error } = await supabase.from('delivery_fees').insert([{
      area_name: newArea.trim(),
      fee: parseFloat(newFee),
      sort_order: maxOrder + 1,
    }]);
    if (error) {
      toast({ title: 'خطأ', description: 'فشل في الإضافة', variant: 'destructive' });
    } else {
      setNewArea('');
      setNewFee('');
      toast({ title: 'تمت الإضافة' });
      fetchFees();
    }
    setSaving(false);
  };

  const handleUpdate = async (id: string, field: 'area_name' | 'fee', value: string) => {
    const patch: any = field === 'fee' ? { fee: parseFloat(value) || 0 } : { area_name: value };
    setFees((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    await supabase.from('delivery_fees').update(patch).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذه المنطقة؟')) return;
    const { error } = await supabase.from('delivery_fees').delete().eq('id', id);
    if (error) {
      toast({ title: 'خطأ', description: 'فشل في الحذف', variant: 'destructive' });
    } else {
      toast({ title: 'تم الحذف' });
      fetchFees();
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          رسوم التوصيل
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {fees.map((f) => (
              <div key={f.id} className="flex items-center gap-2">
                <Input
                  value={f.area_name}
                  onChange={(e) => handleUpdate(f.id, 'area_name', e.target.value)}
                  placeholder="المنطقة"
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={f.fee}
                  onChange={(e) => handleUpdate(f.id, 'fee', e.target.value)}
                  placeholder="الرسوم"
                  className="w-24"
                  dir="ltr"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(f.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {fees.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">لا توجد مناطق بعد</p>
            )}
          </div>
        )}

        <div className="border-t border-border pt-4 space-y-2">
          <Label>إضافة منطقة جديدة</Label>
          <div className="flex items-center gap-2">
            <Input
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              placeholder="اسم المنطقة"
              className="flex-1"
            />
            <Input
              type="number"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              placeholder="الرسوم"
              className="w-24"
              dir="ltr"
            />
            <Button size="icon" onClick={handleAdd} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
