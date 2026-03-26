import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, ShoppingCart } from 'lucide-react';
import { blogApi, BlogPost, productApi, Product } from '../services/api';
import { Seo } from '../components/Seo';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { getSiteUrl, absoluteUrl } from '../utils/siteUrl';
import { plainTextExcerpt } from '../utils/seoText';
import { normalizeArray } from '../utils/arrayUtils';
import { Footer } from '../components/common/Footer';
import { getWebpCandidate } from '../utils/image';

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { siteSettings } = useSiteSettings();

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);

  const currentSlug = slug ?? '';

  const siteUrl = getSiteUrl();
  const blogUrl = useMemo(() => `${siteUrl}/blog/${currentSlug}`, [siteUrl, currentSlug]);

  const blogCategoryName = useMemo(() => {
    if (!blog?.category) return null;
    if (typeof blog.category === 'string') return blog.category;
    return blog.category.name;
  }, [blog]);

  const blogBuyCta = useMemo(() => {
    if (!blog) return null;

    const fromConfiguredProduct = blog.cta_product;
    if (fromConfiguredProduct?.affiliateLink) {
      return {
        href: fromConfiguredProduct.affiliateLink,
        label:
          blog.cta_label?.trim() ||
          `Buy on ${fromConfiguredProduct.affiliateStoreName?.trim() || 'Amazon'}`,
      };
    }

    if (blog.cta_url) {
      return {
        href: blog.cta_url,
        label: blog.cta_label?.trim() || 'Buy Now',
      };
    }

    // Optional fallback: if admin added a safe partner link inside HTML, use first valid anchor.
    const html = blog.content || '';
    const anchorMatch = html.match(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/i);
    if (!anchorMatch) return null;

    const href = anchorMatch[1]?.trim();
    if (!href || !/^https?:\/\//i.test(href)) return null;

    const labelFromHtml = (anchorMatch[2] || '').replace(/<[^>]+>/g, '').trim();
    return {
      href,
      label: blog.cta_label?.trim() || labelFromHtml || 'Buy Now',
    };
  }, [blog]);

  useEffect(() => {
    if (!slug) return;

    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const post = await blogApi.getBySlug(slug);
        setBlog(post);

        // If an admin configured "recommended_products" for this blog post,
        // prefer that. Otherwise fall back to category-based recommendations.
        const recommended = (post as any).recommended_products;
        if (Array.isArray(recommended) && recommended.length > 0) {
          setRelatedProducts(recommended as Product[]);
        } else {
          try {
            const cat = post.category;
            const categoryName = typeof cat === 'string' ? cat : cat?.name;
            const related = await productApi.getAll({
              category: categoryName || undefined,
              page: 1,
              page_size: 6,
              // Fallback ordering when admin didn't configure recommended products.
              ordering: '-created_at',
            });
            const list = normalizeArray<Product>(related).slice(0, 6);
            setRelatedProducts(list.filter((p) => p.id !== undefined).slice(0, 6));
          } catch {
            setRelatedProducts([]);
          }
        }

        // Related blogs (best-effort).
        try {
          const all = await blogApi.getAll({
            page: 1,
            page_size: 10,
            ordering: '-published_at',
          });
          const list = normalizeArray<BlogPost>(all);
          setRelatedBlogs(
            list.filter((p) => p.slug !== slug).slice(0, 4),
          );
        } catch {
          setRelatedBlogs([]);
        }
      } catch (err: any) {
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load blog post';
        setError(message);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const RecommendedProductCard = ({ product, index }: { product: Product; index: number }) => {
    const storeName = product.affiliateStoreName?.trim() || 'Amazon';

    const webpImage = getWebpCandidate(product.image);
    const srcToUse = webpImage || product.image;
    const originalSrc = product.image;

    const handleBuy = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!product.affiliateLink) return;
      window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
    };

    return (
      <Link
        to={`/product/${product.id}`}
        className="group relative block min-w-[255px] sm:min-w-0 sm:w-full snap-start touch-manipulation rounded-2xl"
      >
        <div className="relative bg-gray-900/45 backdrop-blur-lg border border-gray-800/50 rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-cyan-500/40 group-hover:shadow-2xl group-hover:shadow-cyan-500/10">
          {/* Number chip (kept subtle; not covering the image) */}
          <div className="absolute top-4 left-4 z-20">
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-semibold shadow-lg">
              #{index + 1}
            </div>
          </div>

          <div className="p-4 pt-14">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-900/40 border border-gray-800/50">
              <img
                src={srcToUse}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const triedWebpFallback = target.dataset.webpFallbackTried === '1';
                  if (!triedWebpFallback) {
                    target.dataset.webpFallbackTried = '1';
                    target.src = originalSrc;
                    return;
                  }
                  target.src =
                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYyOTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                }}
              />
            </div>

            <div className="mt-4">
              {product.is_trending && (
                <div className="mb-2 inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
                  🔥 Trending
                </div>
              )}

              <h3 className="text-white font-semibold text-base line-clamp-2 group-hover:text-cyan-300 transition-colors">
                {product.name}
              </h3>
              <p className="text-gray-400 text-sm mt-1 line-clamp-1">{product.tagline}</p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-cyan-300 text-sm inline-flex items-center gap-1">
                  View More <ExternalLink className="w-4 h-4 shrink-0" aria-hidden />
                </span>

                {product.affiliateLink && (
                  <button
                    type="button"
                    onClick={handleBuy}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all shadow shadow-cyan-500/20"
                    aria-label={`Buy on ${storeName}`}
                    title={`Buy on ${storeName}`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Buy on {storeName}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const metaDesc = blog
    ? plainTextExcerpt(blog.excerpt || blog.content || '', 160) || siteSettings.description
    : siteSettings.description;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <Seo
          title={`Loading… | ${siteSettings.brand_name}`}
          description={siteSettings.description}
          path={location.pathname}
          siteName={siteSettings.brand_name}
          noindex
        />
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading post…</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <Seo
          title={`Blog not found | ${siteSettings.brand_name}`}
          description={siteSettings.description}
          path={location.pathname}
          siteName={siteSettings.brand_name}
          noindex
        />
        <div className="text-center px-4">
          <h2 className="text-2xl text-white mb-4">Post not found</h2>
          <p className="text-gray-400 mb-4">{error || 'This blog post does not exist.'}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>
    );
  }

  const title = `${blog.title} | ${siteSettings.brand_name}`;

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: plainTextExcerpt(blog.excerpt || blog.content || '', 160),
    image: blog.cover_image ? absoluteUrl(blog.cover_image, siteUrl) : undefined,
    datePublished: blog.published_at,
    dateModified: blog.updated_at,
    author: { '@type': 'Organization', name: blog.author_name || siteSettings.brand_name },
    publisher: { '@type': 'Organization', name: siteSettings.brand_name },
    mainEntityOfPage: { '@type': 'WebPage', '@id': blogUrl },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <Seo
        title={title}
        description={metaDesc}
        path={`/blog/${blog.slug}`}
        image={blog.cover_image ?? undefined}
        ogType="article"
        siteName={siteSettings.brand_name}
        jsonLd={blogJsonLd}
      />

      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <Link to="/" className="text-cyan-400 hover:text-cyan-300 text-sm">
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 pb-10">
        {/* Keep the main blog content readable, but allow recommended products to use more width. */}
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{blog.title}</h1>

          {blog.excerpt && (
            <p className="text-gray-400 text-sm leading-relaxed mb-8">{blog.excerpt}</p>
          )}

          {blogBuyCta && (
            <div className="mb-6 flex justify-center">
              <a
                href={blogBuyCta.href}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
              >
                <ShoppingCart className="w-4 h-4" />
                {blogBuyCta.label}
              </a>
            </div>
          )}

          <article className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-6">
            <div
              className="text-gray-300 leading-relaxed blog-content [&_a]:text-cyan-400 [&_a:hover]:text-cyan-300 [&_h2]:text-white [&_h2]:mt-8 [&_h3]:text-white [&_h3]:mt-6 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: blog.content || '' }}
            />
          </article>

          {blogCategoryName && (
            <div className="mt-8">
              <Link
                to={`/?category=${encodeURIComponent(blogCategoryName)}`}
                className="inline-flex items-center px-3 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-cyan-300 text-sm hover:bg-gray-800/70 hover:border-cyan-500/40"
              >
                Explore {blogCategoryName}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </div>
          )}
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <div className="mb-5">
              <h2 className="text-2xl text-white">Recommended picks</h2>
              <p className="text-gray-400 text-sm mt-1">
                Picked for this guide. Tap to view details or buy on the partner site.
              </p>
            </div>

            {/* Mobile: horizontal scroll */}
            <div className="sm:hidden flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
              {relatedProducts.map((p, idx) => (
                <RecommendedProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>

            {/* Desktop: grid */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {relatedProducts.map((p, idx) => (
                <div key={p.id} className="w-full">
                  <RecommendedProductCard product={p} index={idx} />
                </div>
              ))}
            </div>
          </section>
        )}

        {relatedBlogs.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <section className="mt-12">
              <h2 className="text-2xl text-white mb-6">More Guides</h2>
              <div className="space-y-3">
                {relatedBlogs.map((b) => (
                  <Link key={b.slug} to={`/blog/${b.slug}`} className="block">
                    <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-4 hover:border-cyan-500/40 transition-all">
                      <p className="text-white">{b.title}</p>
                      {b.excerpt ? (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{b.excerpt}</p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

