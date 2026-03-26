import React from 'react';
import { ExternalLink, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../services/api';
import { getWebpCandidate } from '../utils/image';

interface ProductCardGlassProps {
  product: Product;
}

export function ProductCardGlass({ product }: ProductCardGlassProps) {
  const handleBuyNowClick = (e: React.MouseEvent) => {
    // Prevent the parent card <Link> navigation
    e.preventDefault();
    e.stopPropagation();

    if (!product.affiliateLink) return;
    window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
  };

  const webpImage = getWebpCandidate(product.image);
  const storeName = product.affiliateStoreName?.trim() || 'Amazon';
  const srcToUse = webpImage || product.image;
  const originalSrc = product.image;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block touch-manipulation rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500/80"
    >
      <div className="relative bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-lg border border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20 md:group-hover:scale-[1.02] active:scale-[0.99]">
        {/* Badge (hide on mobile to avoid interrupting taps) */}
        {product.badge && (
          <div className="hidden sm:inline-flex absolute top-4 left-4 z-10 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs rounded-full shadow-lg">
            {product.badge}
          </div>
        )}
        
        {/* Image */}
        <div className="aspect-square overflow-hidden bg-gray-900/50">
          <img
            src={srcToUse}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const triedWebpFallback = target.dataset.webpFallbackTried === '1';
              if (!triedWebpFallback) {
                target.dataset.webpFallbackTried = '1';
                target.src = originalSrc;
                return;
              }

              // Final fallback (prevents blank cards even if both webp and original fail).
              target.src =
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYyOTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
            }}
          />
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-5">
          {product.is_trending && (
            <div className="mb-2 inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
              🔥 Trending
            </div>
          )}
          <h3 className="text-base sm:text-lg text-white mb-1 line-clamp-2 sm:line-clamp-1 group-hover:text-cyan-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {product.tagline}
          </p>

          {product.price !== undefined && product.price !== null && (
            <p className="text-cyan-300 text-sm mb-3">
              {product.currency || 'INR'} {product.price}
            </p>
          )}
          
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-3">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-yellow-400 text-sm">{product.rating}</span>
            </div>
          )}
          
          {/* CTA Row — min 44px tap targets on mobile */}
          <div className="flex items-stretch sm:items-center justify-between gap-3">
            <span className="text-cyan-400 text-sm inline-flex items-center gap-1.5 min-h-[44px] min-w-[44px] -mx-2 px-2 rounded-lg sm:min-h-0 sm:min-w-0 sm:mx-0 sm:px-0">
              View More
              <ExternalLink className="w-4 h-4 shrink-0" aria-hidden />
            </span>

            <div className="flex items-center gap-2">
              {product.affiliateLink && (
                <button
                  type="button"
                  onClick={handleBuyNowClick}
                  className="min-h-[44px] px-4 py-2.5 sm:min-h-0 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm sm:text-xs font-medium hover:from-cyan-500 hover:to-blue-500 transition-all shadow shadow-cyan-500/20 flex items-center gap-1.5 touch-manipulation shrink-0"
                  aria-label={`Buy on ${storeName}`}
                  title={`Buy on ${storeName}`}
                >
                  <ShoppingCart className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  <span className="text-sm sm:text-xs font-semibold inline-flex items-center gap-1">
                    Buy on {storeName}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
