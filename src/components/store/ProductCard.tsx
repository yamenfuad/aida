import { Plus, Check } from 'lucide-react';
import { Product } from '@/types/product';
import { formatPrice } from '@/lib/formatPrice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const cartItem = items.find((item) => item.id === product.id);
  const isInCart = !!cartItem;

  const handleAdd = () => {
    setIsAdding(true);
    addItem(product);
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <Card className="overflow-hidden bg-card shadow-card hover:shadow-hover transition-all duration-300 animate-slide-up">
      <div className="aspect-[4/5] relative overflow-hidden bg-secondary">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-4xl">📦</span>
          </div>
        )}
        {isInCart && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
            {cartItem.quantity} في السلة
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <span className="text-primary font-bold text-lg">
            {formatPrice(product.price)}
          </span>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={isAdding}
            className="shrink-0 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isAdding ? (
              <Check className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
