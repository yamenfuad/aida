import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/store/Header';
import { SearchBar } from '@/components/store/SearchBar';
import { CategoryFilter } from '@/components/store/CategoryFilter';
import { ProductGrid } from '@/components/store/ProductGrid';
import { CartDrawer } from '@/components/store/CartDrawer';
import { Product, ProductCategory } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('available', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data as Product[]);
    }
    setLoading(false);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory
        ? product.category === selectedCategory
        : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setCartOpen(true)} />

      <main className="container py-4 space-y-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        <ProductGrid products={filteredProducts} loading={loading} />
      </main>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default Index;
