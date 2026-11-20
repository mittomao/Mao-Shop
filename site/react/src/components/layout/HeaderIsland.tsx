import TopBar from './TopBar';
import Header from './Header';

export default function HeaderIsland() {
  const handleOpenMobileMenu = () => {
    window.dispatchEvent(new CustomEvent('shop:open-mobile-menu'));
  };

  return (
    <div className="site-header-island sticky top-0 z-50">
      <div className="bg-gradient-to-r from-primary-light via-primary to-primary">
        <TopBar />
      </div>
      <Header onOpenMobileMenu={handleOpenMobileMenu} />
    </div>
  );
}
