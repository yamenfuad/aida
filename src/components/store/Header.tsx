import { ShoppingCart, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center">
            <Store className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">متجر عايدة</h1>
            <p className="text-xs text-muted-foreground">للمواد الغذائية والمنزلية</p>
          </div>
        </div>

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
    </header>
  );
}
