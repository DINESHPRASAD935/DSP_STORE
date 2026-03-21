/** Public site origin for canonical URLs and Open Graph (no trailing slash). */
export function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL as string | undefined;
  if (fromEnv?.trim()) {
    return fromEnv.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://mrdsphub.in';
}

/** Absolute URL for an image that may be protocol-relative, path-only, or absolute. */
export function absoluteUrl(href: string | null | undefined, base: string): string | undefined {
  if (!href?.trim()) return undefined;
  const h = href.trim();
  if (h.startsWith('http://') || h.startsWith('https://')) return h;
  if (h.startsWith('//')) return `https:${h}`;
  return `${base}${h.startsWith('/') ? h : `/${h}`}`;
}
