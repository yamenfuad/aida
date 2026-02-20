import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory, CATEGORIES, StoreSettings } from '@/types/product';
import { formatPrice } from '@/lib/formatPrice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Search, LogOut, Store, Settings, Package, Download, Upload, ImageIcon, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { z } from 'zod';

// Validation schema for store settings
const settingsSchema = z.object({
  whatsapp_number: z.string()
    .regex(/^[0-9]{10,15}$/, 'رقم واتساب يجب أن يحتوي على 10-15 رقم فقط'),
  app_download_url: z.string()
    .url('رابط التطبيق غير صالح')
    .or(z.literal(''))
});

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('المواد الأساسية');
  const [formAvailable, setFormAvailable] = useState(true);
  
  // Two-step add product state
  const [addStep, setAddStep] = useState<'upload' | 'form'>('upload');
  const [imageUploaded, setImageUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Settings
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [appDownloadUrl, setAppDownloadUrl] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/admin/login');
      } else if (!isAdmin) {
        toast({
          title: 'غير مصرح',
          description: 'ليس لديك صلاحية الوصول لهذه الصفحة',
          variant: 'destructive',
        });
        navigate('/');
      } else {
        fetchProducts();
        fetchSettings();
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل المنتجات',
        variant: 'destructive',
      });
    } else {
      setProducts(data as Product[]);
    }
    setLoading(false);
  };

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (data && !error) {
      setWhatsappNumber(data.whatsapp_number);
      setAppDownloadUrl(data.app_download_url || '');
    }
  };

  const handleSaveSettings = async () => {
    // Clean the WhatsApp number - remove non-digits
    const cleanedWhatsappNumber = whatsappNumber.replace(/\D/g, '');
    
    // Validate inputs
    const validation = settingsSchema.safeParse({
      whatsapp_number: cleanedWhatsappNumber,
      app_download_url: appDownloadUrl.trim()
    });
    
    if (!validation.success) {
      toast({
        title: 'خطأ في البيانات',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }
    
    setSavingSettings(true);
    const { error } = await supabase
      .from('store_settings')
      .update({ 
        whatsapp_number: cleanedWhatsappNumber, 
        app_download_url: appDownloadUrl.trim(),
        updated_at: new Date().toISOString() 
      })
      .not('id', 'is', null);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ الإعدادات',
        variant: 'destructive',
      });
    } else {
      // Update state with cleaned value
      setWhatsappNumber(cleanedWhatsappNumber);
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ الإعدادات بنجاح',
      });
    }
    setSavingSettings(false);
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormImageUrl('');
    setFormDescription('');
    setFormCategory('المواد الأساسية');
    setFormAvailable(true);
    setAddStep('upload');
    setImageUploaded(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormImageUrl(product.image_url || '');
    setFormDescription((product as any).description || '');
    setFormCategory(product.category);
    setFormAvailable(product.available);
    setAddStep('form');
    setImageUploaded(true);
    setIsDialogOpen(true);
  };

  const compressImage = (file: File, maxSizeKB: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        let quality = 0.9;
        
        const tryCompress = () => {
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) { resolve(new Blob([file])); return; }
              if (blob.size <= maxSizeKB * 1024 || quality <= 0.1) {
                resolve(blob);
              } else {
                quality -= 0.1;
                if (quality <= 0.3 && blob.size > maxSizeKB * 1024) {
                  // Also reduce dimensions
                  width = Math.floor(width * 0.85);
                  height = Math.floor(height * 0.85);
                }
                tryCompress();
              }
            },
            'image/jpeg',
            quality
          );
        };
        tryCompress();
      };
      img.src = url;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار ملف صورة فقط',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      let uploadFile: Blob = file;
      if (file.size > 50 * 1024) {
        uploadFile = await compressImage(file, 50);
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('aida-img')
        .upload(filePath, uploadFile, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('aida-img')
        .getPublicUrl(filePath);

      setFormImageUrl(urlData.publicUrl);
      setImageUploaded(true);
      setAddStep('form');
      
      toast({
        title: 'تم الرفع',
        description: 'تم رفع الصورة بنجاح',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'خطأ في الرفع',
        description: error.message || 'فشل في رفع الصورة',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!formName.trim() || !formPrice) {
      toast({
        title: 'خطأ',
        description: 'الرجاء ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const productData = {
      name: formName.trim(),
      price: parseFloat(formPrice),
      image_url: formImageUrl.trim() || null,
      description: formDescription.trim() || null,
      category: formCategory,
      available: formAvailable,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (error) {
        toast({
          title: 'خطأ',
          description: 'فشل في تحديث المنتج',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'تم التحديث', description: 'تم تحديث المنتج بنجاح' });
        fetchProducts();
        setIsDialogOpen(false);
      }
    } else {
      const { error } = await supabase.from('products').insert([productData]);

      if (error) {
        toast({
          title: 'خطأ',
          description: 'فشل في إضافة المنتج',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'تم الإضافة', description: 'تم إضافة المنتج بنجاح' });
        fetchProducts();
        setIsDialogOpen(false);
      }
    }
    setSaving(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف المنتج',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'تم الحذف', description: 'تم حذف المنتج بنجاح' });
      fetchProducts();
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-soft">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">لوحة التحكم</h1>
              <p className="text-xs text-muted-foreground">متجر عايدة</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <Store className="w-4 h-4 ml-2" />
              المتجر
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 px-4">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              المنتجات
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن منتج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddDialog} className="gap-2">
                    <Plus className="w-4 h-4" />
                    إضافة منتج
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {!editingProduct && addStep === 'form' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAddStep('upload');
                            setImageUploaded(false);
                            setFormImageUrl('');
                          }}
                          className="p-1 h-auto"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                      )}
                      {editingProduct ? 'تعديل المنتج' : (addStep === 'upload' ? 'رفع صورة المنتج' : 'إضافة منتج جديد')}
                    </DialogTitle>
                  </DialogHeader>
                  
                  {/* Step 1: Image Upload */}
                  {!editingProduct && addStep === 'upload' && (
                    <div className="py-8">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div 
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        {uploading ? (
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <p className="text-muted-foreground">جاري رفع الصورة...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                              <Upload className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">اضغط لاختيار صورة</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                يجب رفع صورة المنتج أولاً
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Product Form - shown after image upload or when editing */}
                  {(addStep === 'form' && (imageUploaded || editingProduct)) && (
                    <div className="flex flex-col max-h-[70vh]">
                      <div className="space-y-4 py-4 overflow-y-auto flex-1">
                        {/* Image Preview */}
                        {formImageUrl && (
                          <div className="flex justify-center">
                            <div className="w-32 h-32 rounded-xl overflow-hidden border border-border">
                              <img
                                src={formImageUrl}
                                alt="صورة المنتج"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Image URL Input - for editing */}
                        {editingProduct && (
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" />
                              رابط الصورة
                            </Label>
                            <Input
                              value={formImageUrl}
                              onChange={(e) => setFormImageUrl(e.target.value)}
                              placeholder="أدخل رابط الصورة"
                              dir="ltr"
                              className="text-left text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                              يمكنك تغيير رابط الصورة يدوياً أو رفع صورة جديدة
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              ref={fileInputRef}
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                              className="w-full gap-2"
                            >
                              {uploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                              رفع صورة جديدة
                            </Button>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <Label>اسم المنتج *</Label>
                          <Input
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="أدخل اسم المنتج"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>وصف المنتج</Label>
                          <Textarea
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            placeholder="أدخل وصف المنتج"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>السعر (ر.س) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formPrice}
                            onChange={(e) => setFormPrice(e.target.value)}
                            placeholder="0.00"
                            dir="ltr"
                            className="text-left"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>التصنيف</Label>
                          <Select value={formCategory} onValueChange={(v) => setFormCategory(v as ProductCategory)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>متوفر</Label>
                          <Switch checked={formAvailable} onCheckedChange={setFormAvailable} />
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border mt-2">
                        <Button onClick={handleSaveProduct} className="w-full gap-2" disabled={saving}>
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            editingProduct ? 'حفظ التعديلات' : 'حفظ المنتج'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                            <p className="text-primary font-bold mt-1">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                product.available
                                  ? 'bg-success/10 text-success'
                                  : 'bg-destructive/10 text-destructive'
                              }`}
                            >
                              {product.available ? 'متوفر' : 'غير متوفر'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                          >
                            <Pencil className="w-4 h-4 ml-1" />
                            تعديل
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4 ml-1" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد منتجات</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>إعدادات المتجر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>رقم واتساب الطلبات</Label>
                  <Input
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="966500000000"
                    dir="ltr"
                    className="text-left"
                  />
                  <p className="text-xs text-muted-foreground">
                    أدخل الرقم بدون علامة + (مثال: 966500000000)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    رابط تنزيل التطبيق
                  </Label>
                  <Input
                    value={appDownloadUrl}
                    onChange={(e) => setAppDownloadUrl(e.target.value)}
                    placeholder="https://example.com/app.apk"
                    dir="ltr"
                    className="text-left"
                  />
                  <p className="text-xs text-muted-foreground">
                    أدخل رابط تنزيل التطبيق (اتركه فارغاً لإخفاء الزر)
                  </p>
                </div>
                <Button onClick={handleSaveSettings} disabled={savingSettings}>
                  {savingSettings ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'حفظ الإعدادات'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
