import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsApi } from '../services/api';

export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });

    // Track public page views for admin analytics.
    // Avoid counting admin UI views.
    if (pathname.startsWith('/adminui')) return;

    analyticsApi
      .trackView({
        path: `${pathname}${search}`,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      })
      .catch(() => {
        // Never block navigation on analytics failures.
      });
  }, [pathname, search]);

  return null;
}

