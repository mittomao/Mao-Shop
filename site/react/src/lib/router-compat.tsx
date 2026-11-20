import React, { useEffect, useState } from 'react';

export function BrowserRouter({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function MemoryRouter({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function Link({ to, href, children, ...props }: any) {
  const target = to || href || '#';
  return (
    <a href={target} {...props}>
      {children}
    </a>
  );
}

export function useLocation() {
  const [loc, setLoc] = useState(() => {
    if (typeof window === 'undefined') return { pathname: '/', search: '', hash: '' };
    return { pathname: window.location.pathname, search: window.location.search, hash: window.location.hash };
  });

  useEffect(() => {
    const handlePopState = () => {
      setLoc({ pathname: window.location.pathname, search: window.location.search, hash: window.location.hash });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return loc;
}

export function useNavigate() {
  return (to: string | number) => {
    if (typeof to === 'number') {
      window.history.go(to);
    } else {
      window.location.href = to;
    }
  };
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T {
  if (typeof window === 'undefined') return {} as T;
  const path = window.location.pathname.replace(/\/$/, '');
  const segments = path.split('/').filter(Boolean);
  const slug = segments.length > 0 ? decodeURIComponent(segments[segments.length - 1]) : '';
  return { slug } as unknown as T;
}

export function useSearchParams() {
  const [searchParams, setSearchParamsState] = useState(() => {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  });

  useEffect(() => {
    const handlePopState = () => {
      setSearchParamsState(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setSearchParams = (next: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams)) => {
    if (typeof window === 'undefined') return;
    const current = new URLSearchParams(window.location.search);
    const nextParams = typeof next === 'function' ? next(current) : next;
    const newSearch = nextParams.toString();
    const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}${window.location.hash}`;
    window.history.pushState({}, '', newUrl);
    setSearchParamsState(new URLSearchParams(newSearch));
  };

  return [searchParams, setSearchParams] as const;
}
