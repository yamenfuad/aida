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
    <Card className="overflow-hidden bg-card shadow-card hover:shadow-hover transition-all duration-300 animate-slide-up rounded-2xl">
      <div className="aspect-square relative overflow-hidden bg-primary/10 rounded-t-2xl">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-6xl">📦</span>
          </div>
        )}
        {isInCart && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full font-medium">
            {cartItem.quantity} في السلة
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="bg-accent text-accent-foreground text-xs px-3 py-1 rounded-full font-medium">
            {product.category}
          </span>
        </div>
        <h3 className="font-bold text-foreground text-lg leading-tight">
          {product.name}
        </h3>
        <p className="text-primary font-bold text-2xl">
          {formatPrice(product.price)}
        </p>
        <Button
          onClick={handleAdd}
          disabled={isAdding}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-xl font-bold"
        >
          {isAdding ? (
            <Check className="w-5 h-5 ml-2" />
          ) : (
            <Plus className="w-5 h-5 ml-2" />
          )}
          إضافة للسلة
        </Button>
      </CardContent>
    </Card>
  );
}
