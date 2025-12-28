import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/store/Header';
import { SearchBar } from '@/components/store/SearchBar';
import { CategoryFilter } from '@/components/store/CategoryFilter';
import { ProductGrid } from '@/components/store/ProductGrid';
import { CartDrawer } from '@/components/store/CartDrawer';
import { Product, ProductCategory } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import aidaLogo from '@/assets/Aida.png';

const Index = () => {
  const navigate = useNavigate();
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

      {/* Hero Section */}
      <section className="py-8 bg-gradient-to-b from-primary/10 to-background">
        <div className="container text-center space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            مرحباً بك في متجرنا
          </h1>
          <img 
            src={aidaLogo} 
            alt="شعار المتجر" 
            className="w-32 h-32 md:w-40 md:h-40 mx-auto object-contain"
          />
          <p className="text-muted-foreground text-lg">
            <span 
              onClick={() => navigate('/admin-login')}
              className="cursor-pointer opacity-0 hover:opacity-10 select-none"
            >
              •
            </span>
            اكتشف منتجاتنا المميزة و اطلب ما تحتاجه عبر واتساب.
          </p>
        </div>
      </section>

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
