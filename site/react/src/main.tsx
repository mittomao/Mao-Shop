import React, { Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { ShopProvider } from './context/ShopContext';
import { getComponent } from './registry';
import './index.css';

interface ErrorBoundaryProps {
  name: string;
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class IslandErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[React Island Error in "${this.props.name}"]:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-600">
            <strong>Không thể hiển thị khối tương tác:</strong> {this.props.name}
          </div>
        )
      );
    }
    return this.props.children;
  }
}

function mountIslands() {
  const elements = document.querySelectorAll<HTMLElement>('[data-react]');
  elements.forEach((el) => {
    // Avoid re-mounting already mounted islands
    if (el.dataset.reactMounted === 'true') return;

    const componentName = el.getAttribute('data-react');
    if (!componentName) return;

    const Component = getComponent(componentName);
    if (!Component) {
      console.warn(`[React Island] Unknown component: "${componentName}"`);
      return;
    }

    let props: Record<string, any> = {};
    const rawProps = el.getAttribute('data-props');
    if (rawProps) {
      try {
        props = JSON.parse(rawProps);
      } catch (err) {
        console.error(`[React Island] Failed to parse data-props for "${componentName}":`, err, rawProps);
      }
    }

    try {
      el.dataset.reactMounted = 'true';
      const root = createRoot(el);
      root.render(
        <React.StrictMode>
          <IslandErrorBoundary name={componentName}>
            <MotionConfig reducedMotion="user">
              <BrowserRouter>
                <ShopProvider>
                  <Component {...props} />
                </ShopProvider>
              </BrowserRouter>
            </MotionConfig>
          </IslandErrorBoundary>
        </React.StrictMode>,
      );
    } catch (err) {
      console.error(`[React Island] Failed to mount "${componentName}":`, err);
    }
  });
}

// Global click handler to ensure cross-page links perform full MPA server navigation
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement)?.closest?.('a');
    if (!a || !a.href || a.target || a.hasAttribute('download')) return;
    try {
      const targetUrl = new URL(a.href, window.location.origin);
      if (
        targetUrl.origin === window.location.origin &&
        targetUrl.pathname !== window.location.pathname &&
        !targetUrl.pathname.startsWith('/#') &&
        targetUrl.pathname !== ''
      ) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = a.href;
      }
    } catch {
      // ignore
    }
  }, true);
}

// Auto mount when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountIslands);
} else {
  mountIslands();
}

export { mountIslands };
