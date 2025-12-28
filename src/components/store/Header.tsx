import { ShoppingCart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import aidaLogo from '@/assets/Aida.png';

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const { totalItems } = useCart();
  const [appDownloadUrl, setAppDownloadUrl] = useState('');
  const [showLogoDialog, setShowLogoDialog] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('store_settings')
      .select('app_download_url')
      .limit(1)
      .maybeSingle();

    if (data && !error) {
      setAppDownloadUrl(data.app_download_url || '');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="container flex items-center justify-between h-16 px-4">
        <Dialog open={showLogoDialog} onOpenChange={setShowLogoDialog}>
          <DialogTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <img src={aidaLogo} alt="متجر عايدة" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-foreground">متجر عايدة</h1>
                <p className="text-xs text-muted-foreground">للمواد الغذائية والمنزلية</p>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-xs text-center">
            <div className="flex flex-col items-center gap-4 py-4">
              <img src={aidaLogo} alt="متجر عايدة" className="w-32 h-32 object-contain" />
              <div className="space-y-2">
                <p className="text-foreground font-semibold">تصميم : أ / فؤاد محمد المصباحي</p>
                <a 
                  href="tel:967773226263" 
                  className="text-primary font-bold text-lg block hover:underline"
                  dir="ltr"
                >
                  967773226263
                </a>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex items-center gap-2">
          {appDownloadUrl && (
            <a href={appDownloadUrl} download>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">تنزيل التطبيق</span>
              </Button>
            </a>
          )}
          <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={onCartClick}
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <Badge
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground"
              >
                {totalItems}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
