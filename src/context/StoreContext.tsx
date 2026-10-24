import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type Cart, type User } from '../lib/api';

type Credentials = { email: string; password: string };
type StoreContextValue = {
  user: User | null;
  cart: Cart;
  loading: boolean;
  login: (data: Credentials) => Promise<void>;
  register: (data: Credentials & { name: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshCart: () => Promise<void>;
  addToCart: (variantId: number, quantity?: number) => Promise<void>;
  removeFromCart: (variantId: number) => Promise<void>;
  updateCart: (variantId: number, quantity: number) => Promise<void>;
};

const emptyCart: Cart = { items: [], totalCents: 0, count: 0 };
const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try { setCart((await api<{ cart: Cart }>('/api/cart')).cart); }
    catch { setCart(emptyCart); }
  }, []);

  useEffect(() => {
    api<{ user: User }>('/api/auth/me')
      .then(({ user }) => { setUser(user); return api<{ cart: Cart }>('/api/cart'); })
      .then(({ cart }) => setCart(cart))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (data: Credentials) => {
    const response = await api<{ user: User }>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });
    setUser(response.user);
    await refreshCart();
  };
  const register = async (data: Credentials & { name: string }) => {
    const response = await api<{ user: User }>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
    setUser(response.user);
    await refreshCart();
  };
  const logout = async () => { await api('/api/auth/logout', { method: 'POST' }); setUser(null); setCart(emptyCart); };
  const addToCart = async (variantId: number, quantity = 1) => {
    const response = await api<{ cart: Cart }>('/api/cart', { method: 'POST', body: JSON.stringify({ variantId, quantity }) });
    setCart(response.cart);
  };
  const updateCart = async (variantId: number, quantity: number) => {
    const response = await api<{ cart: Cart }>(`/api/cart/${variantId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) });
    setCart(response.cart);
  };
  const removeFromCart = async (variantId: number) => { await api(`/api/cart/${variantId}`, { method: 'DELETE' }); await refreshCart(); };

  return <StoreContext.Provider value={{ user, cart, loading, login, register, logout, refreshCart, addToCart, removeFromCart, updateCart }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore precisa estar dentro de StoreProvider');
  return value;
}
