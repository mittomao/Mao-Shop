import type { ComponentType } from 'react';
import AccessoryGrid from './components/home/AccessoryGrid';
import CategorySection from './components/home/CategorySection';
import DealTabs from './components/home/DealTabs';
import FlashSale from './components/home/FlashSale';
import Hero from './components/home/Hero';
import News from './components/home/News';
import Offers from './components/home/Offers';
import PromoStrip from './components/home/PromoStrip';
import Reviews from './components/home/Reviews';
import CartAndMobileDrawers from './components/layout/CartAndMobileDrawers';
import FloatingButtons from './components/layout/FloatingButtons';
import Footer from './components/layout/Footer';
import HeaderActions from './components/layout/HeaderActions';
import HeaderIsland from './components/layout/HeaderIsland';
import CategoryPage from './pages/CategoryPage';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';

export const registry: Record<string, ComponentType<any>> = {
  // Whole Pages as Islands
  HomePage,
  CategoryPage,
  ProductDetailPage,

  // Layout Islands
  HeaderIsland,
  HeaderActions,
  Footer,
  CartAndMobileDrawers,
  FloatingButtons,

  // Section Islands
  Hero,
  PromoStrip,
  FlashSale,
  DealTabs,
  CategorySection,
  AccessoryGrid,
  Reviews,
  Offers,
  News,
};

export function getComponent(name: string): ComponentType<any> | undefined {
  return registry[name];
}
