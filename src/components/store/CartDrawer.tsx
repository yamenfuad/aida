import { X, Plus, Minus, Trash2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const [whatsappNumber, setWhatsappNumber] = useState('966500000000');

  useEffect(() => {
    fetchWhatsappNumber();
  }, []);

  const fetchWhatsappNumber = async () => {
    const { data, error } = await supabase
      .from('store_settings')
      .select('whatsapp_number')
      .limit(1)
      .maybeSingle();

    if (data && !error) {
      setWhatsappNumber(data.whatsapp_number);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: 'السلة فارغة',
        description: 'أضف منتجات إلى السلة أولاً',
        variant: 'destructive',
      });
      return;
    }

    const orderDetails = items
      .map((item) => `• ${item.name} × ${item.quantity} = ${(item.price * item.quantity).toFixed(2)} ر.س`)
      .join('\n');

    const message = `*طلب جديد من متجر عايدة* 🛒\n\n${orderDetails}\n\n*الإجمالي: ${totalPrice.toFixed(2)} ر.س*`;

    const encodedMessage = encodeURIComponent(message);
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    clearCart();
    onClose();
    
    toast({
      title: 'تم إرسال الطلب',
      description: 'سيتم التواصل معك عبر واتساب',
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-right">سلة التسوق</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <span className="text-6xl mb-4">🛒</span>
            <p>السلة فارغة</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-secondary rounded-lg">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground line-clamp-2">
                      {item.name}
                    </h4>
                    <p className="text-primary font-semibold text-sm mt-1">
                      {item.price.toFixed(2)} ر.س
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive mr-auto"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>الإجمالي:</span>
                <span className="text-primary">{totalPrice.toFixed(2)} ر.س</span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-success hover:bg-success/90 text-primary-foreground gap-2"
                size="lg"
              >
                <MessageCircle className="w-5 h-5" />
                إتمام الطلب عبر واتساب
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
