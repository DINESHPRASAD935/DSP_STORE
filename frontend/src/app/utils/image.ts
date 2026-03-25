/** Return a best-effort WebP candidate for jpg/png sources. */
export function getWebpCandidate(src: string | null | undefined): string | null {
  if (!src) return null;
  const clean = src.split('?')[0];
  if (!/\.(jpg|jpeg|png)$/i.test(clean)) return null;
  return src.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2');
}

