import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Star, ShoppingCart, Loader2 } from 'lucide-react';
import { productApi, Product } from '../services/api';
import { AdSlot, hasAdsConfigured } from '../components/AdSlot';
import { Footer } from '../components/common/Footer';
import { NAV, MESSAGES, PRODUCT_DETAIL } from '../constants/strings';
import { useSiteSettings } from '../hooks/useSiteSettings';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { siteSettings } = useSiteSettings();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      try {
        const productData = await productApi.getById(Number(id));
        setProduct(productData);

        // Fetch related products (wrap in try-catch to not fail if this fails)
        try {
          const category = productData.category;
          let categoryFilter: string | number | undefined;
          
          // Use category ID if available, otherwise use name
          if (typeof category === 'object' && category.id) {
            categoryFilter = category.id;
          } else if (typeof category === 'object' && category.name) {
            categoryFilter = category.name;
          } else if (typeof category === 'string') {
            categoryFilter = category;
          }
          
          if (categoryFilter) {
        const related = await productApi.getAll({
              category: categoryFilter.toString(),
          exclude_id: Number(id),
        });
        
        setRelatedProducts(
          Array.isArray(related) ? related.slice(0, 4) : (related.results || []).slice(0, 4)
        );
          }
        } catch (relatedErr: any) {
          // If related products fail, just log and continue
          console.warn('Failed to fetch related products:', relatedErr);
          setRelatedProducts([]);
        }
      } catch (err: any) {
        // Get detailed error message from API response
        const errorMessage = err.response?.data?.detail 
          || err.response?.data?.message 
          || err.response?.data?.error
          || err.message 
          || 'Failed to fetch product';
        console.error('Product fetch error:', err.response?.data || err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const getCategoryName = (category: string | { id: number; name: string; slug: string }): string => {
    if (typeof category === 'string') return category;
    return category.name;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-4">{MESSAGES.ERROR.PRODUCT_NOT_FOUND}</h2>
          <p className="text-gray-400 mb-4">{error || MESSAGES.ERROR.PRODUCT_NOT_EXIST}</p>
          <Link
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            {NAV.BACK_TO_PRODUCTS}
          </Link>
        </div>
      </div>
    );
  }

  const handleBuyNow = () => {
    window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
  };

  const categoryName = getCategoryName(product.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center h-20">
            {/* Back Button - Left Side (Fixed Position, doesn't affect center) */}
            <button
              onClick={() => navigate(-1)}
              className="absolute left-0 z-10 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 hover:border-cyan-500/50 text-gray-300 hover:text-cyan-400 rounded-lg transition-all group"
              aria-label={NAV.BACK_TO_PRODUCTS}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Back</span>
            </button>

            {/* Center - Logo/Title (Perfectly Centered, independent of back button) */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-fit">
              <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                <div className="h-14 w-auto flex items-center justify-center overflow-hidden">
                  {siteSettings?.logo_url || (import.meta as { env?: { VITE_LOGO_URL?: string } }).env?.VITE_LOGO_URL ? (
                    <img 
                      src={siteSettings?.logo_url || (import.meta as { env?: { VITE_LOGO_URL?: string } }).env?.VITE_LOGO_URL || ''} 
                      alt={`${siteSettings?.brand_name || 'Logo'} Logo`} 
                      className="h-full w-auto object-contain max-h-14"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.logo-fallback')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'logo-fallback flex items-center gap-2';
                          const brandName = siteSettings?.brand_name || 'Brand';
                          const tagline = siteSettings?.tagline || '';
                          fallback.innerHTML = `
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
                              <span class="text-white text-lg font-bold">${brandName.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <h1 class="text-xl text-white font-semibold">${brandName}</h1>
                              ${tagline ? `<p class="text-xs text-gray-400">${tagline}</p>` : ''}
                            </div>
                          `;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {(siteSettings?.brand_name || 'Brand').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h1 className="text-xl text-white font-semibold">{siteSettings?.brand_name || 'Brand'}</h1>
                        {siteSettings?.tagline && (
                          <p className="text-xs text-gray-400">{siteSettings.tagline}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl text-white font-semibold">{siteSettings?.brand_name || 'Brand'}</h1>
                  {siteSettings?.tagline && (
                    <p className="text-xs text-gray-400">{siteSettings.tagline}</p>
                  )}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Product Detail */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="relative">
            {product.badge && (
              <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full shadow-xl">
                {product.badge}
              </div>
            )}
            <div className="rounded-2xl overflow-hidden bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[460px] h-[360px] sm:h-[420px] lg:h-[460px] mx-auto lg:mx-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYyOTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                }}
              />
            </div>
          </div>

          {/* Info Section */}
          <div>
            {/* Category Badge */}
            <div className="inline-block px-4 py-1 bg-gray-800/50 border border-gray-700/50 text-cyan-400 text-sm rounded-full mb-4">
              {categoryName}
            </div>

            {/* Title */}
            <h1 className="text-4xl text-white mb-4">{product.name}</h1>

            {/* Tagline */}
            <p className="text-xl text-gray-300 mb-6">{product.tagline}</p>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-8">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.floor(product.rating!)
                          ? 'fill-yellow-400 text-yellow-400'
                          : star - 0.5 <= product.rating!
                          ? 'fill-yellow-400/50 text-yellow-400'
                          : 'fill-gray-700 text-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-yellow-400 text-lg">{product.rating} / 5.0</span>
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={handleBuyNow}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-lg rounded-xl hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 flex items-center justify-center gap-3 group"
            >
              <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {PRODUCT_DETAIL.BUY_NOW}
              <ExternalLink className="w-5 h-5" />
            </button>

            <p className="text-gray-500 text-sm text-center mt-4">
              {PRODUCT_DETAIL.REDIRECT_MESSAGE}
            </p>

            {/* Description */}
            <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-6 mt-8">
              <h2 className="text-xl text-white mb-4">{PRODUCT_DETAIL.ABOUT_PRODUCT}</h2>
              <p className="text-gray-300 leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Creator Review Section - Social Media Links */}
        {product.social_media_links && product.social_media_links.length > 0 && (
          <div className="mt-12 mb-12">
            <h2 className="text-2xl text-white mb-6">{PRODUCT_DETAIL.CREATOR_REVIEW}</h2>
            <div className="space-y-4">
              {product.social_media_links.map((link) => (
                <div
                  key={link.id}
                  className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg text-white mb-2 font-semibold">
                        {link.platform_name}
                      </h3>
                      {link.description && (
                        <p className="text-gray-400 text-sm mb-3">{link.description}</p>
                      )}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 text-sm break-all flex items-center gap-2 group"
                      >
                        <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        {link.url}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ad Slot - Below Product Details and Social Media */}
        {hasAdsConfigured() && (
          <div className="my-12">
            <AdSlot type="horizontal" />
          </div>
        )}

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl text-white mb-8">{PRODUCT_DETAIL.MORE_FROM} {categoryName}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <Link
                  key={relatedProduct.id}
                  to={`/product/${relatedProduct.id}`}
                  className="group block"
                >
                  <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all hover:scale-105">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYyOTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white mb-1 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{relatedProduct.tagline}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
