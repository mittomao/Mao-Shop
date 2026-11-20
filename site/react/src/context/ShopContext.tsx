import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CartItem, CartOptions, Product } from '../types';
import { readStorage, writeStorage } from '../lib/storage';

type Toast = { id: number; message: string };

type ShopContextValue = {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  /** `unitPrice` defaults to `product.price` when no options change the price */
  addToCart: (product: Product, options?: CartOptions, unitPrice?: number) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeFromCart: (lineId: string) => void;
  wishlist: Set<string>;
  toggleWishlist: (product: Product) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  province: string;
  setProvince: (province: string) => void;
  notify: (message: string) => void;
  toasts: Toast[];
};

const ShopContext = createContext<ShopContextValue | null>(null);

const CART_KEY = 'maoshop.cart';
const WISHLIST_KEY = 'maoshop.wishlist';
const PROVINCE_KEY = 'maoshop.province';

export const provinces = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Nghệ An', 'Lào Cai'];

function lineIdOf(productId: string, options?: CartOptions) {
  return [productId, options?.variant ?? '', options?.color ?? ''].join('|');
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() =>
    readStorage<CartItem[]>(CART_KEY, []).filter((i) => i.lineId && typeof i.unitPrice === 'number'),
  );
  const [wishlist, setWishlist] = useState<Set<string>>(() => new Set(readStorage<string[]>(WISHLIST_KEY, [])));
  const [province, setProvince] = useState<string>(() => readStorage(PROVINCE_KEY, provinces[0]));
  const [cartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  // Sync to storage
  useEffect(() => {
    writeStorage(CART_KEY, cart);
  }, [cart]);

  useEffect(() => {
    writeStorage(WISHLIST_KEY, [...wishlist]);
  }, [wishlist]);

  useEffect(() => {
    writeStorage(PROVINCE_KEY, province);
  }, [province]);

  // Cross-island synchronization via DOM CustomEvent
  useEffect(() => {
    const handleSync = () => {
      const storedCart = readStorage<CartItem[]>(CART_KEY, []).filter((i) => i.lineId && typeof i.unitPrice === 'number');
      const storedWishlist = new Set(readStorage<string[]>(WISHLIST_KEY, []));
      const storedProvince = readStorage(PROVINCE_KEY, provinces[0]);
      setCart(storedCart);
      setWishlist(storedWishlist);
      setProvince(storedProvince);
    };

    const handleOpenCart = (e: Event) => {
      const custom = e as CustomEvent;
      setCartOpen(custom.detail !== undefined ? Boolean(custom.detail) : true);
    };

    const handleNotify = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail) {
        const id = ++toastId.current;
        setToasts((t) => [...t, { id, message: custom.detail }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
      }
    };

    window.addEventListener('shop:sync', handleSync);
    window.addEventListener('shop:open-cart', handleOpenCart);
    window.addEventListener('shop:notify', handleNotify);

    return () => {
      window.removeEventListener('shop:sync', handleSync);
      window.removeEventListener('shop:open-cart', handleOpenCart);
      window.removeEventListener('shop:notify', handleNotify);
    };
  }, []);

  const broadcastSync = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shop:sync'));
    }
  }, []);

  const notify = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shop:notify', { detail: message }));
    }
  }, []);

  const addToCart = useCallback(
    (product: Product, options?: CartOptions, unitPrice = product.price) => {
      const lineId = lineIdOf(product.id, options);
      setCart((items) => {
        let updated: CartItem[];
        if (items.some((i) => i.lineId === lineId)) {
          updated = items.map((i) => (i.lineId === lineId ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
          updated = [...items, { lineId, product, options, unitPrice, quantity: 1 }];
        }
        writeStorage(CART_KEY, updated);
        broadcastSync();
        return updated;
      });
      notify(`Đã thêm "${product.name}" vào giỏ hàng`);
      // Also open cart or trigger badge
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shop:open-cart', { detail: true }));
      }
    },
    [notify, broadcastSync],
  );

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setCart((items) => {
      const updated = quantity <= 0 ? items.filter((i) => i.lineId !== lineId) : items.map((i) => (i.lineId === lineId ? { ...i, quantity } : i));
      writeStorage(CART_KEY, updated);
      broadcastSync();
      return updated;
    });
  }, [broadcastSync]);

  const removeFromCart = useCallback((lineId: string) => {
    setCart((items) => {
      const updated = items.filter((i) => i.lineId !== lineId);
      writeStorage(CART_KEY, updated);
      broadcastSync();
      return updated;
    });
  }, [broadcastSync]);

  const toggleWishlist = useCallback(
    (product: Product) => {
      const liked = wishlist.has(product.id);
      setWishlist((prev) => {
        const next = new Set(prev);
        if (liked) next.delete(product.id);
        else next.add(product.id);
        writeStorage(WISHLIST_KEY, [...next]);
        broadcastSync();
        return next;
      });
      notify(liked ? 'Đã bỏ khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích');
    },
    [wishlist, notify, broadcastSync],
  );

  const handleSetCartOpen = useCallback((open: boolean) => {
    setCartOpen(open);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shop:open-cart', { detail: open }));
    }
  }, []);

  const handleSetProvince = useCallback((prov: string) => {
    setProvince(prov);
    writeStorage(PROVINCE_KEY, prov);
    broadcastSync();
  }, [broadcastSync]);

  const value = useMemo<ShopContextValue>(
    () => ({
      cart,
      cartCount: cart.reduce((n, i) => n + i.quantity, 0),
      cartTotal: cart.reduce((n, i) => n + i.quantity * i.unitPrice, 0),
      addToCart,
      updateQuantity,
      removeFromCart,
      wishlist,
      toggleWishlist,
      cartOpen,
      setCartOpen: handleSetCartOpen,
      province,
      setProvince: handleSetProvince,
      notify,
      toasts,
    }),
    [cart, addToCart, updateQuantity, removeFromCart, wishlist, toggleWishlist, cartOpen, handleSetCartOpen, province, handleSetProvince, notify, toasts],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopContextValue {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used inside <ShopProvider>');
  return ctx;
}
