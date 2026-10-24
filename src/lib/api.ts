export type User = { id: number; name: string; email: string; role: 'customer' | 'admin' };
export type Product = { id: number; name: string; slug: string; description: string; category: string; categorySlug: string; priceCents: number; comparePriceCents: number | null; imageKey: string; stock: number };
export type Variant = { id: number; size: string; color: string; sku: string; stock: number };
export type CartItem = { variantId: number; quantity: number; size: string; color: string; stock: number; productId: number; name: string; priceCents: number; imageKey: string };
export type Cart = { items: CartItem[]; totalCents: number; count: number };
export type Order = { id: number; status: string; totalCents: number; shippingName: string; shippingAddress: string; createdAt: string };

export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new ApiError(body.message || 'Não foi possível concluir a solicitação.', response.status);
  return body as T;
}

export const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
