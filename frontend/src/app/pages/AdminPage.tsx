import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Plus,
  List,
  BarChart3,
  Home,
  Upload,
  Tag,
  DollarSign,
  Save,
  Edit,
  Archive,
  Trash2,
  X,
  Loader2,
  ArchiveRestore,
  Star
} from 'lucide-react';
import { productApi, categoryApi, badgeApi, siteSettingsApi, Product, Category, Badge, ProductCreateData, SiteSettings } from '../services/api';
import { NAV, ADMIN, MESSAGES } from '../constants/strings';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { Seo } from '../components/Seo';

type Tab = 'dashboard' | 'add' | 'list' | 'archived' | 'settings';

export function AdminPage() {
  const { siteSettings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [archivedProducts, setArchivedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<number | null>(null);
  const [showArchiveDialog, setShowArchiveDialog] = useState<number | null>(null);
  const [settingsFormData, setSettingsFormData] = useState<Partial<SiteSettings>>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    image: '',
    category_id: '',
    affiliateLink: '',
    affiliateStoreName: '',
    badge_id: '',
    rating: '4.5'
  });

  // Fetch data on mount and when tab changes
  useEffect(() => {
    fetchCategories();
    fetchBadges();
    if (activeTab === 'list' || activeTab === 'dashboard') {
      fetchProducts();
      fetchArchivedProducts(); // Also fetch archived to get accurate total count
    } else if (activeTab === 'archived') {
      fetchArchivedProducts();
    } else if (activeTab === 'settings') {
      fetchSiteSettings();
    }
  }, [activeTab]);
  
  const fetchSiteSettings = async () => {
    setSettingsLoading(true);
    try {
      const data = await siteSettingsApi.get();
      setSettingsFormData(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load site settings');
    } finally {
      setSettingsLoading(false);
    }
  };
  
  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      await siteSettingsApi.update(settingsFormData);
      toast.success('Site settings saved successfully!');
      // Refresh site settings hook
      window.location.reload(); // Simple refresh to update all components
    } catch (err: any) {
      toast.error(err.message || 'Failed to save site settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      // Ensure data is an array (handle paginated response)
      const categoriesArray = Array.isArray(data) ? data : (data.results || []);
      setCategories(categoriesArray);
      if (categoriesArray.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: categoriesArray[0].id.toString() }));
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]); // Set empty array on error
    }
  };

  const fetchBadges = async () => {
    try {
      const data = await badgeApi.getAll();
      setBadges(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching badges:', err);
      setBadges([]);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all products by getting all pages
      let allProducts: Product[] = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await productApi.getAll({ page });
      const productsList = response.results || (Array.isArray(response) ? response : []);
        allProducts = [...allProducts, ...productsList];
        
        // Check if there are more pages
        if (response.next) {
          page++;
        } else {
          hasMore = false;
        }
        
        // If response doesn't have pagination info, assume single page
        if (!response.results && !response.next) {
          hasMore = false;
        }
      }
      
      setProducts(allProducts);
    } catch (err: any) {
      setError(err.message || MESSAGES.ERROR.FETCH_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productApi.getArchived();
      setArchivedProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || MESSAGES.ERROR.FETCH_ARCHIVED);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      tagline: '',
      description: '',
      image: '',
      category_id: categories.length > 0 ? categories[0].id.toString() : '',
      affiliateLink: '',
      affiliateStoreName: '',
      badge_id: '',
      rating: '4.5',
    });
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const productData: ProductCreateData = {
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        image: formData.image,
        category_id: parseInt(formData.category_id),
        affiliateLink: formData.affiliateLink,
        affiliateStoreName: formData.affiliateStoreName.trim(),
        badge_id: formData.badge_id === '' ? null : (formData.badge_id ? parseInt(formData.badge_id) : null),
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
      };

      if (editingProduct) {
        // Update existing product
        await productApi.update(editingProduct.id, productData);
        toast.success(MESSAGES.SUCCESS.PRODUCT_UPDATED);
      } else {
        // Create new product
        await productApi.create(productData);
        toast.success(MESSAGES.SUCCESS.PRODUCT_CREATED);
      }

      resetForm();
      fetchProducts();
      setActiveTab('list');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || MESSAGES.ERROR.FETCH_PRODUCTS;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (product: Product) => {
    setLoading(true);
    try {
      // Fetch full product details (including description) from API
      const fullProduct = await productApi.getById(product.id);
      
      const categoryId = typeof fullProduct.category === 'object' 
        ? fullProduct.category.id 
        : categories.find(c => c.name === fullProduct.category)?.id || categories[0]?.id;

      // Find badge_id from badge name
      const badgeId = fullProduct.badge 
        ? badges.find(b => b.display_name === fullProduct.badge || b.name === fullProduct.badge)?.id 
        : null;

    setFormData({
        name: fullProduct.name,
        tagline: fullProduct.tagline,
        description: fullProduct.description || '',
        image: fullProduct.image,
      category_id: categoryId?.toString() || '',
        affiliateLink: fullProduct.affiliateLink,
        affiliateStoreName: fullProduct.affiliateStoreName?.trim() ?? '',
        badge_id: badgeId?.toString() || '',
        rating: fullProduct.rating?.toString() || '4.5',
    });
      setEditingProduct(fullProduct);
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || MESSAGES.ERROR.LOAD_PRODUCT_DETAILS;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: number) => {
    setLoading(true);
    try {
      await productApi.archive(id);
        toast.success(MESSAGES.SUCCESS.PRODUCT_ARCHIVED);
      fetchProducts();
      if (activeTab === 'archived') {
        fetchArchivedProducts();
      }
      setShowArchiveDialog(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || MESSAGES.ERROR.FETCH_PRODUCTS;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (id: number) => {
    setLoading(true);
    try {
      await productApi.unarchive(id);
        toast.success(MESSAGES.SUCCESS.PRODUCT_UNARCHIVED);
      fetchArchivedProducts();
      fetchProducts();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || MESSAGES.ERROR.FETCH_PRODUCTS;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    // Confirmation is handled by the dialog UI
    setLoading(true);
    try {
      await productApi.delete(id);
        toast.success(MESSAGES.SUCCESS.PRODUCT_DELETED);
      fetchProducts();
      if (activeTab === 'archived') {
        fetchArchivedProducts();
      }
      setShowDeleteDialog(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || MESSAGES.ERROR.FETCH_PRODUCTS;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (category: string | { id: number; name: string; slug: string }): string => {
    if (typeof category === 'string') return category;
    return category.name;
  };

  const activeProducts = products.filter(p => !p.is_archived);
  // Total products = active + archived (to get accurate count even with pagination)
  const totalProducts = activeProducts.length + archivedProducts.length;
  const avgRating = activeProducts.length > 0
    ? (activeProducts.reduce((sum, p) => {
        const rating = Number(p.rating) || 0;
        return sum + rating;
      }, 0) / activeProducts.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <Seo
        title={`Admin | ${siteSettings.brand_name}`}
        description="Store administration — not indexed for search."
        path="/adminmrdsp"
        siteName={siteSettings.brand_name}
        noindex
      />
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
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
                        fallback.innerHTML = `
                          <div class="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
                            <span class="text-white text-lg font-bold">${brandName.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <h1 class="text-xl text-white">${ADMIN.TITLE}</h1>
                            <p class="text-xs text-gray-400">${ADMIN.SUBTITLE}</p>
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
                        {(siteSettings?.brand_name || 'A').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h1 className="text-xl text-white">{ADMIN.TITLE}</h1>
                      <p className="text-xs text-gray-400">{ADMIN.SUBTITLE}</p>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl text-white">{ADMIN.TITLE}</h1>
                <p className="text-xs text-gray-400">{ADMIN.SUBTITLE}</p>
              </div>
            </div>

            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">{NAV.VIEW_STORE}</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-5rem)]">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900/50 backdrop-blur-lg border-r border-gray-800/50 hidden md:block">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => { setActiveTab('dashboard'); resetForm(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              {ADMIN.TABS.DASHBOARD}
            </button>

            <button
              onClick={() => { setActiveTab('add'); resetForm(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'add'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <Plus className="w-5 h-5" />
              {editingProduct ? ADMIN.TABS.EDIT_PRODUCT : ADMIN.TABS.ADD_PRODUCT}
            </button>

            <button
              onClick={() => { setActiveTab('list'); resetForm(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <List className="w-5 h-5" />
              {ADMIN.TABS.PRODUCT_LIST}
            </button>

            <button
              onClick={() => { setActiveTab('archived'); resetForm(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'archived'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <Archive className="w-5 h-5" />
              {ADMIN.TABS.ARCHIVED}
            </button>

            <button
              onClick={() => { setActiveTab('settings'); resetForm(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <Edit className="w-5 h-5" />
              Site Settings
            </button>

            <div className="pt-4 border-t border-gray-800/50">
              <div className="px-4 py-3 text-gray-400 text-sm flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {ADMIN.TABS.ANALYTICS}
              </div>
            </div>
          </nav>
        </aside>

        {/* Mobile Tab Selector */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-xl border-t border-gray-800/50 z-50">
          <div className="flex">
            <button
              onClick={() => { setActiveTab('dashboard'); resetForm(); }}
              className={`flex-1 py-4 flex flex-col items-center gap-1 ${
                activeTab === 'dashboard' ? 'text-cyan-400' : 'text-gray-400'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-xs">{ADMIN.MOBILE_TABS.DASHBOARD}</span>
            </button>
            <button
              onClick={() => { setActiveTab('add'); resetForm(); }}
              className={`flex-1 py-4 flex flex-col items-center gap-1 ${
                activeTab === 'add' ? 'text-cyan-400' : 'text-gray-400'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">{ADMIN.MOBILE_TABS.ADD}</span>
            </button>
            <button
              onClick={() => { setActiveTab('list'); resetForm(); }}
              className={`flex-1 py-4 flex flex-col items-center gap-1 ${
                activeTab === 'list' ? 'text-cyan-400' : 'text-gray-400'
              }`}
            >
              <List className="w-5 h-5" />
              <span className="text-xs">{ADMIN.MOBILE_TABS.LIST}</span>
            </button>
            <button
              onClick={() => { setActiveTab('archived'); resetForm(); }}
              className={`flex-1 py-4 flex flex-col items-center gap-1 ${
                activeTab === 'archived' ? 'text-cyan-400' : 'text-gray-400'
              }`}
            >
              <Archive className="w-5 h-5" />
              <span className="text-xs">{ADMIN.MOBILE_TABS.ARCHIVED}</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24 md:pb-8">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-3xl text-white mb-8">{ADMIN.TABS.DASHBOARD}</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-300">{ADMIN.STATS.TOTAL_PRODUCTS}</h3>
                    <List className="w-8 h-8 text-cyan-400" />
                  </div>
                  <p className="text-4xl text-white">{totalProducts}</p>
                </div>

                <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-lg border border-green-500/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-300">{ADMIN.STATS.CATEGORIES}</h3>
                    <Tag className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-4xl text-white">{categories.length}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-300">{ADMIN.STATS.AVG_RATING}</h3>
                    <BarChart3 className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-4xl text-white">{avgRating}</p>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-6">
                <h3 className="text-xl text-white mb-4">{ADMIN.STATS.CATEGORY_DISTRIBUTION}</h3>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.isArray(categories) && categories.length > 0 ? (
                      categories.map(category => {
                      const count = activeProducts.filter(p => getCategoryName(p.category) === category.name).length;
                      const percentage = totalProducts > 0 ? (count / totalProducts) * 100 : 0;
                      return (
                        <div key={category.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-300">{category.name}</span>
                            <span className="text-gray-400 text-sm">{count} {ADMIN.STATS.PRODUCTS}</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                      })
                    ) : (
                      <p className="text-gray-400 text-center py-4">{MESSAGES.ERROR.NO_CATEGORIES}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl text-white">
                  {editingProduct ? ADMIN.TABS.EDIT_PRODUCT : ADMIN.TABS.ADD_NEW_PRODUCT}
                </h2>
                {editingProduct && (
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    {ADMIN.FORM.CANCEL_EDIT}
                  </button>
                )}
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="max-w-2xl">
                <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-6 space-y-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-gray-300 mb-2">{ADMIN.FORM.PRODUCT_NAME}</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder={ADMIN.PLACEHOLDERS.PRODUCT_NAME}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  {/* Tagline */}
                  <div>
                    <label className="block text-gray-300 mb-2">{ADMIN.FORM.TAGLINE}</label>
                    <input
                      type="text"
                      name="tagline"
                      value={formData.tagline}
                      onChange={handleInputChange}
                      required
                      placeholder={ADMIN.PLACEHOLDERS.TAGLINE}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-gray-300 mb-2">{ADMIN.FORM.DESCRIPTION}</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder={ADMIN.PLACEHOLDERS.DESCRIPTION}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-gray-300 mb-2 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {ADMIN.FORM.IMAGE_URL}
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      required
                      placeholder={ADMIN.PLACEHOLDERS.IMAGE_URL}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-400">
                        💡 Recommended: Square image (800x800px), JPEG/WebP format, max 5MB
                      </p>
                      <p className="text-xs text-cyan-400">
                        ✅ Works: AWS S3, Google Cloud Storage, Cloudinary, iStockphoto, Unsplash, Pexels, Imgur
                      </p>
                      <p className="text-xs text-yellow-400">
                        ⚠️ Won't work: Pinterest, Google Drive, Dropbox (CORS restrictions)
                      </p>
                      <details className="text-xs text-gray-500 mt-2">
                        <summary className="cursor-pointer hover:text-gray-400">Examples & More Info</summary>
                        <div className="mt-2 pl-4 space-y-1">
                          <p><strong>AWS S3:</strong> https://bucket.s3.amazonaws.com/image.jpg</p>
                          <p><strong>iStockphoto:</strong> https://media.istockphoto.com/id/123/photo/name.jpg</p>
                          <p><strong>Unsplash:</strong> https://images.unsplash.com/photo-1234567890</p>
                          <p className="text-xs text-gray-400 mt-2">See guides/IMAGE_URL_GUIDE.md for complete list</p>
                        </div>
                      </details>
                    </div>
                    {/* Image Preview */}
                    {formData.image && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-400 mb-2">Preview:</p>
                        <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700/50">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYyOTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmNTkzMDciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-full flex items-center justify-center p-2">
                                    <p class="text-xs text-red-400 text-center">❌ Image not accessible<br/>Check URL or CORS</p>
                                  </div>
                                `;
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-gray-300 mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      {ADMIN.FORM.CATEGORY}
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      {Array.isArray(categories) && categories.length > 0 ? (
                        categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                        ))
                      ) : (
                        <option value="">{ADMIN.FORM.LOADING_CATEGORIES}</option>
                      )}
                    </select>
                  </div>

                  {/* Affiliate Link */}
                  <div>
                    <label className="block text-gray-300 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      {ADMIN.FORM.AFFILIATE_LINK}
                    </label>
                    <input
                      type="url"
                      name="affiliateLink"
                      value={formData.affiliateLink}
                      onChange={handleInputChange}
                      required
                      placeholder={ADMIN.PLACEHOLDERS.AFFILIATE_LINK}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2" htmlFor="affiliateStoreName">
                      {ADMIN.FORM.AFFILIATE_STORE_NAME}
                    </label>
                    <input
                      id="affiliateStoreName"
                      type="text"
                      name="affiliateStoreName"
                      value={formData.affiliateStoreName}
                      onChange={handleInputChange}
                      autoComplete="off"
                      placeholder={ADMIN.PLACEHOLDERS.AFFILIATE_STORE_NAME}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <p className="text-gray-500 text-xs mt-1.5">{ADMIN.NOTES.AFFILIATE_STORE_NAME}</p>
                  </div>

                  {/* Badge */}
                  <div>
                    <label className="block text-gray-300 mb-2">
                      {ADMIN.FORM.BADGE}
                    </label>
                    <select
                      name="badge_id"
                      value={formData.badge_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">{ADMIN.FORM.NO_BADGE}</option>
                      {badges.map(badge => (
                        <option key={badge.id} value={badge.id}>
                          {badge.display_name || badge.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-gray-300 mb-2">{ADMIN.FORM.RATING}</label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  {/* Social Media Links Section */}
                  <div className="border-t border-gray-700/50 pt-6 mt-6">
                    <h3 className="text-lg text-white mb-4">Creator Review Content (Optional)</h3>
                    <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                      <p className="text-cyan-300 text-sm mb-2">
                        💡 <strong>Social Media Links</strong>
                      </p>
                      <p className="text-gray-400 text-xs">
                        {ADMIN.NOTES.SOCIAL_MEDIA_NOTE}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        {ADMIN.NOTES.SOCIAL_MEDIA_LINK}
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-lg rounded-xl hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {editingProduct ? ADMIN.FORM.UPDATING : ADMIN.FORM.CREATING}
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editingProduct ? ADMIN.FORM.UPDATE_PRODUCT : ADMIN.FORM.SAVE_PRODUCT}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'list' && (
            <div>
              <h2 className="text-3xl text-white mb-8">{ADMIN.TABLE.PRODUCT_LIST}</h2>
              
              {loading ? (
                <div className="text-center py-24">
                  <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">{ADMIN.TABLE.LOADING_PRODUCTS}</p>
                </div>
              ) : error ? (
                <div className="text-center py-24">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : (
                <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-gray-300">{ADMIN.TABLE.PRODUCT}</th>
                          <th className="px-6 py-4 text-left text-gray-300">{ADMIN.TABLE.CATEGORY}</th>
                          <th className="px-6 py-4 text-left text-gray-300">{ADMIN.TABLE.RATING}</th>
                          <th className="px-6 py-4 text-left text-gray-300">{ADMIN.TABLE.BADGE}</th>
                          <th className="px-6 py-4 text-left text-gray-300">{ADMIN.TABLE.ACTIONS}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                              {ADMIN.TABLE.NO_PRODUCTS}
                            </td>
                          </tr>
                        ) : (
                          products.map(product => (
                            <tr key={product.id} className="hover:bg-gray-800/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                  <div>
                                    <p className="text-white">{product.name}</p>
                                    <p className="text-gray-400 text-sm">{product.tagline}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 bg-gray-800/50 text-gray-300 text-sm rounded-full">
                                  {getCategoryName(product.category)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {product.rating ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-sm font-medium">{product.rating}</span>
                                    <div className="flex items-center gap-0.5">
                                      {[1, 2, 3, 4, 5].map(star => {
                                        const rating = Number(product.rating) || 0;
                                        const isFull = star <= Math.floor(rating);
                                        const isPartial = star === Math.ceil(rating) && rating % 1 !== 0;
                                        const fillPercentage = isPartial ? (rating % 1) * 100 : 0;
                                        
                                        return (
                                          <div key={star} className="relative w-3.5 h-3.5">
                                            {/* Empty star background */}
                                            <Star className="w-3.5 h-3.5 text-gray-600 fill-gray-700" />
                                            {/* Filled portion */}
                                            {isFull && (
                                              <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500 absolute top-0 left-0" />
                                            )}
                                            {/* Partial fill */}
                                            {isPartial && (
                                              <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${fillPercentage}%` }}>
                                                <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {product.badge ? (
                                  <span className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 text-sm rounded-full border border-cyan-500/30">
                                    {product.badge}
                                  </span>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEdit(product)}
                                    className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all"
                                    title={ADMIN.ACTIONS.EDIT}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setShowArchiveDialog(product.id)}
                                    className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition-all"
                                    title={ADMIN.ACTIONS.ARCHIVE}
                                  >
                                    <Archive className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteDialog(product.id)}
                                    className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all"
                                    title={ADMIN.ACTIONS.DELETE}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'archived' && (
            <div>
              <h2 className="text-3xl text-white mb-8">{ADMIN.TABLE.ARCHIVED_PRODUCTS}</h2>
              
              {loading ? (
                <div className="text-center py-24">
                  <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">{ADMIN.TABLE.LOADING_ARCHIVED}</p>
                </div>
              ) : error ? (
                <div className="text-center py-24">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : (
                <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-gray-300">{ADMIN.TABLE.PRODUCT}</th>
                          <th className="px-6 py-4 text-left text-gray-300">{ADMIN.TABLE.CATEGORY}</th>
                          <th className="px-6 py-4 text-left text-gray-300">{ADMIN.TABLE.RATING}</th>
                          <th className="px-6 py-4 text-left text-gray-300">{ADMIN.TABLE.ACTIONS}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {archivedProducts.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                              {ADMIN.TABLE.NO_ARCHIVED}
                            </td>
                          </tr>
                        ) : (
                          archivedProducts.map(product => (
                            <tr key={product.id} className="hover:bg-gray-800/30 transition-colors opacity-75">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFmMjkzNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TkE8L3RleHQ+PC9zdmc+';
                                    }}
                                  />
                                  <div>
                                    <p className="text-white">{product.name}</p>
                                    <p className="text-gray-400 text-sm">{product.tagline}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 bg-gray-800/50 text-gray-300 text-sm rounded-full">
                                  {getCategoryName(product.category)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-300">
                                {product.rating ? `⭐ ${product.rating}` : '-'}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleUnarchive(product.id)}
                                    className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-all"
                                    title={ADMIN.ACTIONS.UNARCHIVE}
                                  >
                                    <ArchiveRestore className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteDialog(product.id)}
                                    className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all"
                                    title={ADMIN.ACTIONS.DELETE}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl text-white">Site Settings</h2>
                <button
                  onClick={handleSaveSettings}
                  disabled={settingsSaving || settingsLoading}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all font-medium shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {settingsSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>

              {settingsLoading ? (
                <div className="text-center py-24">
                  <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Loading site settings...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Branding Section */}
                  <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-6">
                    <h3 className="text-xl text-white mb-6 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-cyan-400" />
                      Branding
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Brand Name</label>
                        <input
                          type="text"
                          value={settingsFormData.brand_name || ''}
                          onChange={(e) => setSettingsFormData({...settingsFormData, brand_name: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="Mr DSP Hub"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Tagline</label>
                        <input
                          type="text"
                          value={settingsFormData.tagline || ''}
                          onChange={(e) => setSettingsFormData({...settingsFormData, tagline: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="Premium Picks"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Description</label>
                        <textarea
                          value={settingsFormData.description || ''}
                          onChange={(e) => setSettingsFormData({...settingsFormData, description: e.target.value})}
                          rows={3}
                          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="Your trusted destination for premium product reviews..."
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Logo URL (Header)</label>
                        <input
                          type="url"
                          value={settingsFormData.logo_url || ''}
                          onChange={(e) => setSettingsFormData({...settingsFormData, logo_url: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="https://your-cdn.com/logo.png"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Footer Logo URL (Optional)</label>
                        <input
                          type="url"
                          value={settingsFormData.footer_logo_url || ''}
                          onChange={(e) => setSettingsFormData({...settingsFormData, footer_logo_url: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="https://your-cdn.com/footer-logo.png"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-6">
                    <h3 className="text-xl text-white mb-6 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-cyan-400" />
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Contact Email</label>
                        <input
                          type="email"
                          value={settingsFormData.contact_email || ''}
                          onChange={(e) => setSettingsFormData({...settingsFormData, contact_email: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="contact@mrdsphub.com"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Contact Phone</label>
                        <input
                          type="text"
                          value={settingsFormData.contact_phone || ''}
                          onChange={(e) => setSettingsFormData({...settingsFormData, contact_phone: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="+91 9876543210"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Operating Hours</label>
                        <input
                          type="text"
                          value={settingsFormData.operating_hours || ''}
                          onChange={(e) => setSettingsFormData({...settingsFormData, operating_hours: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="07:00 AM - 07:00 PM"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">WhatsApp URL (floating button only)</label>
                        <p className="text-gray-500 text-xs mb-2">
                          Used only for the left floating WhatsApp shortcut. Add your WhatsApp <strong className="text-gray-400">channel</strong> under{' '}
                          <span className="text-cyan-400/90">Social Media</span> in admin for footer deals and social icons.
                        </p>
                        <input
                          type="url"
                          value={settingsFormData.whatsapp_url || ''}
                          onChange={(e) => setSettingsFormData({...settingsFormData, whatsapp_url: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="https://wa.me/1234567890"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Configuration */}
                  <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-6">
                    <h3 className="text-xl text-white mb-2 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-cyan-400" />
                      Email Configuration
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Optional. Falls back to .env variables if not set. EMAIL_HOST_USER and EMAIL_HOST_PASSWORD must be set in .env file for security.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Email From Address</label>
                        <input
                          type="email"
                          value={settingsFormData.email_from_address || ''}
                          onChange={(e) => setSettingsFormData({...settingsFormData, email_from_address: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="noreply@mrdsphub.com"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Email Backend (Optional)</label>
                        <input
                          type="text"
                          value={settingsFormData.email_backend || ''}
                          onChange={(e) => setSettingsFormData({...settingsFormData, email_backend: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="django.core.mail.backends.smtp.EmailBackend"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">SMTP Host (Optional)</label>
                        <input
                          type="text"
                          value={settingsFormData.email_host || ''}
                          onChange={(e) => setSettingsFormData({...settingsFormData, email_host: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">SMTP Port (Optional)</label>
                        <input
                          type="number"
                          value={settingsFormData.email_port || ''}
                          onChange={(e) => setSettingsFormData({...settingsFormData, email_port: e.target.value ? parseInt(e.target.value) : null})}
                          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="587"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-gray-300">
                          <input
                            type="checkbox"
                            checked={settingsFormData.email_use_tls ?? true}
                            onChange={(e) => setSettingsFormData({...settingsFormData, email_use_tls: e.target.checked})}
                            className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-cyan-600 focus:ring-cyan-500"
                          />
                          Use TLS
                        </label>
                        <label className="flex items-center gap-2 text-gray-300">
                          <input
                            type="checkbox"
                            checked={settingsFormData.email_use_ssl ?? false}
                            onChange={(e) => setSettingsFormData({...settingsFormData, email_use_ssl: e.target.checked})}
                            className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-cyan-600 focus:ring-cyan-500"
                          />
                          Use SSL
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Footer & Credits */}
                  <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-6">
                    <h3 className="text-xl text-white mb-6 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-cyan-400" />
                      Footer & Credits
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Copyright Text</label>
                        <input
                          type="text"
                          value={settingsFormData.copyright_text || ''}
                          onChange={(e) => setSettingsFormData({...settingsFormData, copyright_text: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="All Rights Reserved."
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Developer Credit</label>
                        <input
                          type="text"
                          value={settingsFormData.developer_credit || ''}
                          onChange={(e) => setSettingsFormData({...settingsFormData, developer_credit: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="Developed By Opulent Multimedia"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Developer Credit URL</label>
                        <input
                          type="url"
                          value={settingsFormData.developer_credit_url || ''}
                          onChange={(e) => setSettingsFormData({...settingsFormData, developer_credit_url: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Site Configuration */}
                  <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-6">
                    <h3 className="text-xl text-white mb-6 flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5 text-cyan-400" />
                      Site Configuration
                    </h3>
                    <div>
                      <label className="block text-gray-300 mb-2">Page Size (Products per page)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={settingsFormData.page_size || 30}
                        onChange={(e) => setSettingsFormData({...settingsFormData, page_size: parseInt(e.target.value) || 30})}
                        className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="30"
                      />
                      <p className="text-gray-400 text-sm mt-2">Number of products to display per page (1-100)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Archive Confirmation Dialog */}
      {showArchiveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center">
                <Archive className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl text-white font-semibold">{ADMIN.DIALOG.ARCHIVE_TITLE}</h3>
            </div>
            <p className="text-gray-400 mb-6 pl-16">
              {ADMIN.DIALOG.ARCHIVE_MESSAGE}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowArchiveDialog(null)}
                className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all font-medium"
              >
                {ADMIN.DIALOG.ARCHIVE_CANCEL}
              </button>
              <button
                onClick={() => handleArchive(showArchiveDialog)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all font-medium shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {ADMIN.DIALOG.ARCHIVING}
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    {ADMIN.DIALOG.ARCHIVE_CONFIRM}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl text-white font-semibold">{ADMIN.DIALOG.DELETE_TITLE}</h3>
            </div>
            <p className="text-gray-400 mb-6 pl-16">
              {ADMIN.DIALOG.DELETE_MESSAGE}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(null)}
                className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all font-medium"
              >
                {ADMIN.DIALOG.DELETE_CANCEL}
              </button>
              <button
                onClick={() => handleDelete(showDeleteDialog)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all font-medium shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {ADMIN.DIALOG.DELETING}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {ADMIN.DIALOG.DELETE_CONFIRM}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
