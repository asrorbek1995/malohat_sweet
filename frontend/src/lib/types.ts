/** Backend qaytaradigan ma'lumot tiplari */

export interface Category {
  id: number;
  name: string;
  emoji?: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
}

export interface Product {
  id: number;
  title: string;
  description: string;
  ingredients: string[];
  oldPrice: number | null;
  newPrice: number;
  imageUrl: string;
  categoryId: number | null;
  categoryName?: string | null;
  isOrderBump: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface Story {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl?: string | null;
  type: 'STORY' | 'BANNER';
  sortOrder: number;
  isActive: boolean;
}

export interface OrderItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  isBump?: boolean;
  imageUrl?: string;
}

export type OrderStatus = 'NEW' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: number;
  customerName: string;
  phone: string | null;
  address: string | null;
  comment: string | null;
  totalAmount: number;
  items: OrderItem[];
  status: OrderStatus;
  telegramId: string | null;
  createdAt: string;
}

/** Yuklangan rasm (galereya) */
export interface UploadedImage {
  /** Serverdagi fayl nomi — o‘chirishda shu ishlatiladi */
  name: string;
  url: string;
  size: number;
  originalName?: string;
  createdAt?: number;
}

/** Admin panelidagi "Matnlar" bo'limi maydonlari */
export interface ContentField {
  key: string;
  label: string;
  type: 'text' | 'area' | 'rows';
  hint?: string;
}

export interface ContentGroup {
  title: string;
  fields: ContentField[];
}

export interface SettingsPayload {
  values: Record<string, string>;
  groups: ContentGroup[];
  defaults: Record<string, string>;
}

export interface ReportData {
  days: number;
  from: string;
  totalOrders: number;
  validOrders: number;
  cancelledOrders: number;
  revenue: number;
  soldItems: number;
  averageCheck: number;
  topProducts: { title: string; quantity: number; revenue: number }[];
  chart: { date: string; orders: number; revenue: number }[];
  statusBreakdown: Record<OrderStatus, number>;
  totalUsers: number;
  newUsers: number;
  totalProducts: number;
}
