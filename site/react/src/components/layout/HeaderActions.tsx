import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingCart, Heart, Menu, MapPin, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import { provinces, useShop } from '../../context/ShopContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import { cn } from '../../lib/format';

export default function HeaderActions({ showLocation = true }: { showLocation?: boolean }) {
  const { cartCount, setCartOpen, wishlist, province, setProvince } = useShop();
  const [locationOpen, setLocationOpen] = useState(false);
  const locationRef = useClickOutside(() => setLocationOpen(false));

  const handleOpenMobileMenu = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shop:open-mobile-menu'));
    }
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      {/* Location Selector (optional) */}
      {showLocation && (
        <div ref={locationRef} className="relative hidden md:block">
          <button
            type="button"
            onClick={() => setLocationOpen((v) => !v)}
            aria-expanded={locationOpen}
            className="flex h-10 items-center gap-1.5 rounded-lg bg-white/20 px-3 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-white/30"
          >
            <MapPin className="h-4 w-4" /> {province}
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', locationOpen && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {locationOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="absolute top-12 left-0 z-50 w-44 rounded-xl bg-white p-1.5 shadow-lift ring-1 ring-black/5"
              >
                {provinces.map((p) => (
                  <li key={p}>
                    <button
                      type="button"
                      onClick={() => {
                        setProvince(p);
                        setLocationOpen(false);
                      }}
                      className={cn(
                        'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                        p === province ? 'bg-primary-soft font-semibold text-primary' : 'text-slate-700 hover:bg-page',
                      )}
                    >
                      {p}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Wishlist Link */}
      <a
        href="#wishlist"
        className="relative flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
        aria-label={`Yêu thích (${wishlist.size} sản phẩm)`}
      >
        <span className="relative">
          <Heart className="h-5 w-5" />
          {wishlist.size > 0 && (
            <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-slate-900">
              {wishlist.size}
            </span>
          )}
        </span>
        <span className="hidden xl:inline">Yêu thích</span>
      </a>

      {/* Cart Button */}
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="relative flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
        aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}
      >
        <span className="relative">
          <ShoppingCart className="h-5 w-5" />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-primary"
              >
                {cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span className="hidden xl:inline">Giỏ hàng</span>
      </button>

      {/* Mobile Menu Toggle Button */}
      <button
        type="button"
        onClick={handleOpenMobileMenu}
        aria-label="Mở menu"
        className="rounded-lg p-2 text-white hover:bg-white/15 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
}
