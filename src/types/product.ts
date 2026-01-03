export type ProductCategory =
  | 'المواد الأساسية'
  | 'الزيوت والمعلبات'
  | 'المشروبات'
  | 'الألبان والأجبان'
  | 'الحلويات والشبس'
  | 'المخبوزات'
  | 'التنظيف'
  | 'العناية الشخصية'
  | 'المجمدات'
  | 'مستلزمات المنزل'
  | 'مستلزمات الأطفال'
  | 'أدوات مدرسية'
  | 'خضروات'
  | 'مستلزمات تجميل'
  | 'أخرى';

export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: ProductCategory;
  available: boolean;
  created_at: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface StoreSettings {
  id: string;
  whatsapp_number: string;
  store_name: string;
  updated_at: string;
}

export const CATEGORIES: ProductCategory[] = [
  'المواد الأساسية',
  'الزيوت والمعلبات',
  'المشروبات',
  'الألبان والأجبان',
  'الحلويات والشبس',
  'المخبوزات',
  'التنظيف',
  'العناية الشخصية',
  'المجمدات',
  'مستلزمات المنزل',
  'مستلزمات الأطفال',
  'أدوات مدرسية',
  'خضروات',
  'مستلزمات تجميل',
  'أخرى',
];
