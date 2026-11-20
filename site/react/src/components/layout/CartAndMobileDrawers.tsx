import React, { useEffect, useState } from 'react';
import CartDrawer from './CartDrawer';
import MobileMenu from './MobileMenu';

export default function CartAndMobileDrawers() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleOpenMobileMenu = () => setMobileMenuOpen(true);
    window.addEventListener('shop:open-mobile-menu', handleOpenMobileMenu);
    return () => window.removeEventListener('shop:open-mobile-menu', handleOpenMobileMenu);
  }, []);

  return (
    <>
      <CartDrawer />
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
