/** Strip HTML and shorten for meta descriptions. */
export function plainTextExcerpt(html: string, maxLen = 160): string {
  if (!html) return '';
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1).trimEnd()}\u2026`;
}
