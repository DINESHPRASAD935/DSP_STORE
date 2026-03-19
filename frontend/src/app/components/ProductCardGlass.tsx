import React from 'react';
import { ExternalLink, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../services/api';

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

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-lg border border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20">
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs rounded-full shadow-lg">
            {product.badge}
          </div>
        )}
        
        {/* Image */}
        <div className="aspect-square overflow-hidden bg-gray-900/50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYyOTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
            }}
          />
        </div>
        
        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg text-white mb-1 line-clamp-1 group-hover:text-cyan-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {product.tagline}
          </p>
          
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-3">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-yellow-400 text-sm">{product.rating}</span>
            </div>
          )}
          
          {/* CTA Row */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-cyan-400 text-sm flex items-center gap-1">
              View More
              <ExternalLink className="w-4 h-4" />
            </span>

            <div className="flex items-center gap-2">
              {product.affiliateLink && (
                <button
                  type="button"
                  onClick={handleBuyNowClick}
                  className="px-3 py-1.5 lg:px-2 lg:py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs lg:text-[11px] hover:from-cyan-500 hover:to-blue-500 transition-all shadow shadow-cyan-500/20 flex items-center gap-1"
                  aria-label="Buy now on partner site"
                  title="Buy now on partner site"
                >
                  <ShoppingCart className="w-3.5 h-3.5 lg:w-3 lg:h-3" />
                  Buy Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
