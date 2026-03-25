import { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCardGlass } from '../components/ProductCardGlass';
import { AdSlot, hasAdsConfigured } from '../components/AdSlot';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { Footer } from '../components/common/Footer';
import { productApi, Product } from '../services/api';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useCategories } from '../hooks/useCategories';
import { usePagination } from '../hooks/usePagination';
import { normalizeArray } from '../utils/arrayUtils';
import { NAV, SEARCH, MESSAGES, PAGINATION } from '../constants/strings';
import { Seo } from '../components/Seo';
import { getSiteUrl } from '../utils/siteUrl';
import React from 'react';

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  const { siteSettings, loading: settingsLoading } = useSiteSettings();
  const { categories } = useCategories();
  // Use siteSettings.page_size directly from API - backend uses the same value
  // Wait for settings to load before using pageSize
  const pageSize = settingsLoading ? 3 : (siteSettings?.page_size || 10);
  
  const { currentPage, totalPages, goToPage, setCurrentPage } = usePagination({
    totalCount,
    pageSize,
  });
  
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Fetch products when filters change or pageSize changes
  useEffect(() => {
    // Don't fetch if settings are still loading
    if (settingsLoading) return;
    
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          page: currentPage,
        };
        
        if (selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
        
        if (searchQuery.trim()) {
          params.search = searchQuery;
        }

        const response = await productApi.getAll(params);
        
        if (response.results) {
          setProducts(response.results as Product[]);
          setTotalCount(response.count || 0);
        } else {
          const productsArray = normalizeArray<Product>(response);
          setProducts(productsArray);
          setTotalCount(productsArray.length);
        }
      } catch (err: any) {
        setError(err.message || MESSAGES.ERROR.FETCH_PRODUCTS);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, currentPage, pageSize, settingsLoading]);

  const getCategoryName = (category: string | { id: number; name: string; slug: string }): string => {
    if (typeof category === 'string') return category;
    return category.name;
  };

  const categoryList = ['All', ...categories.map(c => c.name)];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setMobileMenuOpen(false);
  };

  // Check scroll position for category arrows
  const checkScrollPosition = () => {
    if (categoriesScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoriesScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Scroll categories
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left' 
        ? categoriesScrollRef.current.scrollLeft - scrollAmount
        : categoriesScrollRef.current.scrollLeft + scrollAmount;
      categoriesScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Check scroll position when categories change
  useEffect(() => {
    checkScrollPosition();
    if (categoriesScrollRef.current) {
      categoriesScrollRef.current.addEventListener('scroll', checkScrollPosition);
      return () => {
        categoriesScrollRef.current?.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, [categories]);

  const siteUrl = getSiteUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <Seo
        title={siteSettings.brand_name}
        description={siteSettings.description}
        path="/"
        siteName={siteSettings.brand_name}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: siteSettings.brand_name,
            url: siteUrl,
            description: siteSettings.description,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteSettings.brand_name,
            url: siteUrl,
            description: siteSettings.description,
          },
        ]}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between md:gap-4 md:h-20 md:py-0">
            {/* Row 1 — mobile: logo + menu · desktop: logo only (search + About are siblings) */}
            <div className="flex items-center justify-between gap-3 md:contents">
                     {/* Logo */}
                     <Link to="/" className="flex items-center gap-3 flex-shrink-0 min-w-0 max-w-[min(100%,calc(100%-3.5rem))] hover:opacity-90 transition-opacity md:max-w-none">
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
                                     <h1 class="text-xl text-white">${brandName}</h1>
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
                               <h1 className="text-xl text-white">{siteSettings?.brand_name || 'Brand'}</h1>
                               {siteSettings?.tagline && (
                                 <p className="text-xs text-gray-400">{siteSettings.tagline}</p>
                               )}
                             </div>
                           </div>
                         )}
                       </div>
                       <div>
                         <h1 className="text-xl text-white">{siteSettings?.brand_name || 'Brand'}</h1>
                         {siteSettings?.tagline && (
                           <p className="text-xs text-gray-400">{siteSettings.tagline}</p>
                         )}
                       </div>
                     </Link>

            {/* Search — desktop */}
            <div className="hidden md:flex flex-1 min-w-0 max-w-xl mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  placeholder={SEARCH.PLACEHOLDER}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 justify-end">
              <Link
                to="/about"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all"
              >
                {NAV.ABOUT}
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
            </div>

          {/* Mobile: full-width search (easier to tap and read) */}
          <div className="md:hidden pb-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                placeholder={SEARCH.PLACEHOLDER}
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full min-h-[48px] pl-11 pr-4 py-3 text-base bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all touch-manipulation"
              />
            </div>
          </div>

          {/* Mobile Menu — About only (search is always visible above) */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-gray-800/50">
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center min-h-[48px] w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all text-center font-medium touch-manipulation"
              >
                {NAV.ABOUT}
              </Link>
            </div>
          )}
        </div>
        </div>

        {/* Categories — inside sticky header so one bar stays aligned on all screen sizes */}
        <div className="border-t border-gray-800/50 bg-gray-900/50 py-2.5 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center gap-2">
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollCategories('left')}
                  className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-cyan-400 transition-all z-10 touch-manipulation min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 md:w-8 md:h-8 md:rounded-md"
                  aria-label={SEARCH.SCROLL_CATEGORIES_LEFT}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
              )}

              <div
                ref={categoriesScrollRef}
                className="flex gap-2 overflow-x-auto pb-0.5 flex-1 scrollbar-hide snap-x snap-mandatory scroll-pl-1"
              >
                {categoryList.map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-4 py-2.5 min-h-[44px] md:min-h-0 md:px-3 md:py-1.5 text-sm rounded-xl md:rounded-md whitespace-nowrap transition-all flex-shrink-0 snap-start touch-manipulation ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollCategories('right')}
                  className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-cyan-400 transition-all z-10 touch-manipulation min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 md:w-8 md:h-8 md:rounded-md"
                  aria-label={SEARCH.SCROLL_CATEGORIES_RIGHT}
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content — extra bottom padding on small screens so floating actions do not cover cards */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-28 sm:pb-12">
        {/* Stats */}
        <div className="mb-6 sm:mb-8">
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            {SEARCH.SHOWING}{' '}
            <span className="text-cyan-400">
              {loading ? '...' : products.length > 0 ? ((currentPage - 1) * pageSize + 1) : 0}-{Math.min(currentPage * pageSize, totalCount)}
            </span>
            {' '}{SEARCH.OF}{' '}
            <span className="text-cyan-400">{totalCount}</span> {SEARCH.PRODUCTS}
          </p>
        </div>

        {loading && <LoadingSpinner message={MESSAGES.LOADING.PRODUCTS} />}

        {error && !loading && (
          <ErrorMessage
            title={MESSAGES.ERROR.LOAD_PRODUCTS}
            message={`${error}. ${MESSAGES.ERROR.BACKEND_NOT_RUNNING}`}
          />
        )}

        {/* Products Grid with Ad Slots */}
        {!loading && !error && products.length > 0 && (
          <div className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {products.map((product, index) => (
                <React.Fragment key={product.id}>
              <ProductCardGlass 
                product={{
                  ...product,
                  category: getCategoryName(product.category)
                }} 
              />
                  {/* Insert AdSlot after every 9 products */}
                  {(index + 1) % 9 === 0 && index < products.length - 1 && hasAdsConfigured() && (
                    <div className="col-span-full my-6">
                      <AdSlot type="horizontal" />
                    </div>
                  )}
                </React.Fragment>
            ))}
            </div>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <EmptyState
            icon={Search}
            title={MESSAGES.EMPTY.NO_PRODUCTS}
            message={MESSAGES.EMPTY.NO_PRODUCTS_MESSAGE}
          />
        )}

        {!loading && !error && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
