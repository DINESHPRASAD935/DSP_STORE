import axios from 'axios';

// Type definition for Vite environment variables
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly MODE?: string;
}

// API Base URL - automatically detects environment
// Development: uses .env file or defaults to localhost
// Production: uses .env.production file or environment variable
const getApiBaseUrl = (): string => {
  const env = (import.meta as { env?: ImportMetaEnv }).env;
  
  // Priority 1: Check for explicit API URL in environment variable (highest priority)
  if (env?.VITE_API_BASE_URL) {
    return env.VITE_API_BASE_URL;
  }
  
  // Priority 2: Auto-detect based on current hostname (for production deployments)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Production detection: not localhost, not 127.0.0.1, and not private IPs
    const isProduction = hostname !== 'localhost' && 
                        hostname !== '127.0.0.1' && 
                        !hostname.includes('192.168.') &&
                        !hostname.includes('10.') &&
                        !hostname.includes('172.');
    
    if (isProduction) {
      // For production, try to construct API URL from current domain
      // Handle different deployment scenarios:
      
      // Case 1: Custom domain (mrdsphub.in, www.mrdsphub.in)
      if (hostname.includes('mrdsphub.in')) {
        return 'https://api.mrdsphub.in/api';
      }
      
      // Case 2: CloudFront distribution
      if (hostname.includes('cloudfront.net')) {
        return 'https://api.mrdsphub.in/api';
      }
      
      // Case 3: S3 website endpoint (fallback)
      if (hostname.includes('s3-website') || hostname.includes('amazonaws.com')) {
        return 'https://api.mrdsphub.in/api';
      }
      
      // Case 4: Generic production - try to construct from domain
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'https:';
      // Extract root domain (e.g., mrdsphub.in from www.mrdsphub.in)
      const domainParts = hostname.split('.');
      let rootDomain = hostname;
      if (domainParts.length >= 2) {
        // Take last two parts (e.g., mrdsphub.in)
        rootDomain = domainParts.slice(-2).join('.');
      }
      return `${protocol}//api.${rootDomain}/api`;
    }
  }
  
  // Priority 3: Default to localhost for development (backend runs on port 9000)
  return 'http://localhost:9000/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor (for adding auth tokens in future)
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (for error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      // Could redirect to login page here
    } else if (error.response?.status === 400) {
      // Handle bad request - extract detailed error message
      const errorData = error.response.data;
      if (errorData.detail) {
        error.message = errorData.detail;
      } else if (errorData.message) {
        error.message = errorData.message;
      } else if (typeof errorData === 'string') {
        error.message = errorData;
      } else {
        error.message = 'Bad request. Please check the data and try again.';
      }
    } else if (error.code === 'ECONNABORTED') {
      // Handle timeout
      error.message = 'Request timeout. Please try again.';
    } else if (!error.response) {
      // Network error
      error.message = 'Network error. Please check your connection.';
    }
    return Promise.reject(error);
  }
);

// Types
export interface ProductSocialMediaLink {
  id: number;
  platform_name: string;
  url: string;
  description: string;
  order: number;
}

export interface Product {
  id: number;
  name: string;
  tagline: string;
  description: string;
  image: string;
  category: string | { id: number; name: string; slug: string };
  affiliateLink: string;
  badge?: string;
  rating?: number;
  social_media_links?: ProductSocialMediaLink[];
  is_active?: boolean;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface ProductCreateData {
  name: string;
  tagline: string;
  description: string;
  image: string;
  category_id: number;
  affiliateLink: string;
  badge_id?: number | null;
  rating?: number;
}

export interface ProductUpdateData extends Partial<ProductCreateData> {
  is_active?: boolean;
  is_archived?: boolean;
}

// API Functions

// Products
export const productApi = {
  // Get all products
  getAll: async (params?: {
    category?: string;
    search?: string;
    page?: number;
    ordering?: string;
    exclude_id?: number;
  }) => {
    const response = await api.get('/products/', { params });
    return response.data;
  },

  // Get single product
  getById: async (id: number) => {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  },

  // Create product
  create: async (data: ProductCreateData) => {
    const response = await api.post('/products/', data);
    return response.data;
  },

  // Update product
  update: async (id: number, data: ProductUpdateData) => {
    const response = await api.put(`/products/${id}/`, data);
    return response.data;
  },

  // Partial update product
  partialUpdate: async (id: number, data: Partial<ProductUpdateData>) => {
    const response = await api.patch(`/products/${id}/`, data);
    return response.data;
  },

  // Delete product
  delete: async (id: number) => {
    const response = await api.delete(`/products/${id}/`);
    return response.data;
  },

  // Archive product
  archive: async (id: number) => {
    const response = await api.post(`/products/${id}/archive/`);
    return response.data;
  },

  // Unarchive product
  unarchive: async (id: number) => {
    const response = await api.post(`/products/${id}/unarchive/`);
    return response.data;
  },

  // Get archived products
  getArchived: async () => {
    const response = await api.get('/products/archived/');
    return response.data;
  },
};

// Categories
export const categoryApi = {
  // Get all categories
  getAll: async () => {
    const response = await api.get('/categories/');
    return response.data;
  },

  // Get single category
  getById: async (id: number) => {
    const response = await api.get(`/categories/${id}/`);
    return response.data;
  },
};

// Badges
export interface Badge {
  id: number;
  name: string;
  display_name: string;
}

export const badgeApi = {
  // Get all badges
  getAll: async (): Promise<Badge[]> => {
    const response = await api.get('/badges/');
    return response.data;
  },
};

// Social Media
export interface SocialMedia {
  id: number;
  name: string;
  icon_url: string;
  profile_url: string;
  order: number;
  is_active: boolean;
}

export const socialMediaApi = {
  // Get all active social media profiles
  getAll: async (): Promise<SocialMedia[]> => {
    const response = await api.get('/social-media/');
    return response.data;
  },
};

// Site Settings
export interface SiteSettings {
  brand_name: string;
  tagline: string;
  description: string;
  logo_url: string | null;
  footer_logo_url: string | null;
  copyright_text: string;
  developer_credit: string;
  developer_credit_url: string | null;
  contact_email: string;
  contact_phone: string;
  operating_hours: string;
  whatsapp_url?: string | null;
  page_size: number;
  email_from_address?: string | null;
  email_backend?: string | null;
  email_host?: string | null;
  email_port?: number | null;
  email_use_tls?: boolean;
  email_use_ssl?: boolean;
}

export const siteSettingsApi = {
  // Get site settings
  get: async (): Promise<SiteSettings> => {
    const response = await api.get('/site-settings/');
    return response.data;
  },
  
  // Update site settings
  update: async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
    const response = await api.put('/site-settings/update_settings/', data);
    return response.data;
  },
};

// Contact Form
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export const contactApi = {
  // Submit contact form
  submit: async (data: ContactFormData): Promise<ContactFormResponse> => {
    const response = await api.post('/contact/', data);
    return response.data;
  },
};

export default api;
