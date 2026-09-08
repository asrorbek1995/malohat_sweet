/**
 * Backend REST API bilan ishlash.
 * Barcha so'rovlar shu fayl orqali o'tadi.
 */
import type {
  Category,
  Order,
  Product,
  ReportData,
  SettingsPayload,
  Story,
  UploadedImage,
} from './types';

// Bo'sh bo'lsa — shu sahifaning o'z domeni (/api). Next.js uni backendga uzatadi.
const BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  token?: string;
  error?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Server javob bermadi (${res.status})`);
  }

  if (!res.ok || json.ok === false) {
    throw new Error(json.error || `Xatolik yuz berdi (${res.status})`);
  }

  return (json.data ?? json) as T;
}

/** Admin so'rovlari uchun token sarlavhasi */
function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ============================================================
//  OCHIQ (public) API
// ============================================================
export const api = {
  getCategories: () => request<Category[]>('/categories'),

  getProducts: (params?: { categoryId?: number; bestSeller?: boolean; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.categoryId) q.set('categoryId', String(params.categoryId));
    if (params?.bestSeller) q.set('bestSeller', 'true');
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return request<Product[]>(`/products${qs ? `?${qs}` : ''}`);
  },

  getProduct: (id: number) => request<Product>(`/products/${id}`),

  /** Savatchadagi qo'shimcha savdo mahsuloti */
  getOrderBump: () => request<Product | null>('/order-bump'),

  getStories: (type?: 'STORY' | 'BANNER') =>
    request<Story[]>(`/stories${type ? `?type=${type}` : ''}`),

  getSettings: () => request<Record<string, string>>('/settings'),

  createOrder: (payload: {
    customerName: string;
    phone?: string;
    address?: string;
    comment?: string;
    telegramId?: string;
    username?: string;
    items: { productId: number; quantity: number }[];
  }) => request<Order>('/orders', { method: 'POST', body: JSON.stringify(payload) }),

  getMyOrders: (telegramId: string) => request<Order[]>(`/orders/my/${telegramId}`),
};

// ============================================================
//  ADMIN API
// ============================================================
export const adminApi = {
  /** Kirish — Telegram bot yuborgan 4 xonali kod bilan */
  login: async (code: string): Promise<string> => {
    const res = await fetch(`${BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const json: ApiResponse<never> = await res.json();
    if (!res.ok || !json.token) throw new Error(json.error || 'Kirishda xatolik');
    return json.token;
  },

  /** Bot manzili — kirish sahifasidagi "Botni ochish" tugmasi uchun */
  getBotLink: () => request<{ username: string | null; url: string | null }>('/admin/bot-link'),

  // ---- Rasm yuklash (galereya) ----
  uploadImage: async (t: string, file: File): Promise<UploadedImage> => {
    const form = new FormData();
    form.append('file', file);
    // Content-Type'ni brauzer o'zi qo'yadi (boundary bilan) — qo'lda bermaymiz
    const res = await fetch(`${BASE}/admin/upload`, {
      method: 'POST',
      headers: authHeaders(t),
      body: form,
    });
    const json: ApiResponse<UploadedImage> = await res.json();
    if (!res.ok || !json.data) throw new Error(json.error || 'Rasmni yuklab bo‘lmadi');
    return json.data;
  },

  getUploads: (t: string) => request<UploadedImage[]>('/admin/uploads', { headers: authHeaders(t) }),

  deleteUpload: (t: string, name: string) =>
    request<{ name: string }>(`/admin/uploads/${name}`, {
      method: 'DELETE',
      headers: authHeaders(t),
    }),

  // ---- Mahsulotlar ----
  getProducts: (t: string) => request<Product[]>('/admin/products', { headers: authHeaders(t) }),
  createProduct: (t: string, body: Partial<Product>) =>
    request<Product>('/admin/products', { method: 'POST', headers: authHeaders(t), body: JSON.stringify(body) }),
  updateProduct: (t: string, id: number, body: Partial<Product>) =>
    request<Product>(`/admin/products/${id}`, { method: 'PUT', headers: authHeaders(t), body: JSON.stringify(body) }),
  deleteProduct: (t: string, id: number) =>
    request<{ id: number }>(`/admin/products/${id}`, { method: 'DELETE', headers: authHeaders(t) }),

  // ---- Kategoriyalar ----
  getCategories: (t: string) => request<Category[]>('/admin/categories', { headers: authHeaders(t) }),
  createCategory: (t: string, body: Partial<Category>) =>
    request<Category>('/admin/categories', { method: 'POST', headers: authHeaders(t), body: JSON.stringify(body) }),
  updateCategory: (t: string, id: number, body: Partial<Category>) =>
    request<Category>(`/admin/categories/${id}`, { method: 'PUT', headers: authHeaders(t), body: JSON.stringify(body) }),
  deleteCategory: (t: string, id: number) =>
    request<{ id: number }>(`/admin/categories/${id}`, { method: 'DELETE', headers: authHeaders(t) }),

  // ---- Story / Banner ----
  getStories: (t: string) => request<Story[]>('/admin/stories', { headers: authHeaders(t) }),
  createStory: (t: string, body: Partial<Story>) =>
    request<Story>('/admin/stories', { method: 'POST', headers: authHeaders(t), body: JSON.stringify(body) }),
  updateStory: (t: string, id: number, body: Partial<Story>) =>
    request<Story>(`/admin/stories/${id}`, { method: 'PUT', headers: authHeaders(t), body: JSON.stringify(body) }),
  deleteStory: (t: string, id: number) =>
    request<{ id: number }>(`/admin/stories/${id}`, { method: 'DELETE', headers: authHeaders(t) }),

  // ---- Buyurtmalar ----
  getOrders: (t: string) => request<Order[]>('/admin/orders', { headers: authHeaders(t) }),
  updateOrderStatus: (t: string, id: number, status: string) =>
    request<Order>(`/admin/orders/${id}/status`, { method: 'PUT', headers: authHeaders(t), body: JSON.stringify({ status }) }),

  // ---- Hisobot (7 yoki 30 kunlik) ----
  getReport: (t: string, days: number) =>
    request<ReportData>(`/admin/report?days=${days}`, { headers: authHeaders(t) }),

  // ---- Matnlar (reklama va boshqa yozuvlar) ----
  getSettings: (t: string) => request<SettingsPayload>('/admin/settings', { headers: authHeaders(t) }),
  updateSettings: (t: string, body: Record<string, string>) =>
    request<Record<string, string>>('/admin/settings', {
      method: 'PUT',
      headers: authHeaders(t),
      body: JSON.stringify(body),
    }),
  resetSetting: (t: string, key: string) =>
    request<Record<string, string>>(`/admin/settings/${key}/reset`, {
      method: 'POST',
      headers: authHeaders(t),
    }),
};
