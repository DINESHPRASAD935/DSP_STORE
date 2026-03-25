import { Helmet } from 'react-helmet-async';
import { absoluteUrl, getSiteUrl } from '../utils/siteUrl';

export type SeoProps = {
  title: string;
  description?: string;
  path?: string;
  image?: string | null;
  ogType?: 'website' | 'article' | 'product';
  siteName?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export function Seo({
  title,
  description = '',
  path = '/',
  image,
  ogType = 'website',
  siteName = 'Mr DSP Hub',
  noindex,
  jsonLd,
}: SeoProps) {
  const base = getSiteUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${normalizedPath}`;
  const desc = description.slice(0, 320);
  const ogImage = absoluteUrl(image ?? undefined, base);

  const ldList = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{title}</title>
      {desc ? <meta name="description" content={desc} /> : null}
      <link rel="canonical" href={url} />
      <meta
        name="robots"
        content={noindex ? 'noindex, nofollow' : 'index, follow'}
      />
      <meta property="og:title" content={title} />
      {desc ? <meta property="og:description" content={desc} /> : null}
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_IN" />
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      {desc ? <meta name="twitter:description" content={desc} /> : null}
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
      {ldList.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </Helmet>
  );
}
