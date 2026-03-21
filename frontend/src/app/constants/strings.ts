/**
 * Application-wide string constants
 * Centralized location for all user-facing text
 * Makes it easier to maintain, update, and prepare for internationalization
 */

// ==================== BRANDING ====================
export const BRAND = {
  NAME: 'Mr DSP Hub',
  TAGLINE: 'Premium Picks',
  LOGO_ALT: 'Mr DSP Hub Logo',
  FOOTER_COPYRIGHT: '© 2026 Mr DSP Hub. All affiliate links are for demonstration purposes.',
  DESCRIPTION: 'Your trusted destination for premium product reviews and exclusive deals.',
} as const;

// ==================== NAVIGATION ====================
export const NAV = {
  HOME: 'Home',
  ABOUT: 'About',
  CONTACT: 'Contact',
  BACK_TO_STORE: 'Back to Store',
  BACK_TO_PRODUCTS: 'Back to Products',
  VIEW_STORE: 'View Store',
  BACK: 'Back',
} as const;

// ==================== SEARCH & FILTERS ====================
export const SEARCH = {
  PLACEHOLDER: 'Search products...',
  SCROLL_CATEGORIES_LEFT: 'Scroll categories left',
  SCROLL_CATEGORIES_RIGHT: 'Scroll categories right',
  SHOWING: 'Showing',
  OF: 'of',
  PRODUCTS: 'products',
} as const;

// ==================== LOADING & ERRORS ====================
export const MESSAGES = {
  LOADING: {
    PRODUCTS: 'Loading products...',
    CATEGORIES: 'Loading categories...',
  },
  ERROR: {
    FETCH_PRODUCTS: 'Failed to fetch products',
    FETCH_ARCHIVED: 'Failed to fetch archived products',
    LOAD_PRODUCTS: 'Error loading products',
    LOAD_PRODUCT_DETAILS: 'Failed to load product details',
    PRODUCT_NOT_FOUND: 'Product not found',
    PRODUCT_NOT_EXIST: 'The product you are looking for does not exist.',
    BACKEND_NOT_RUNNING: 'Unable to connect to the backend API. Please check your connection and ensure the backend server is running.',
    NO_CATEGORIES: 'No categories found',
  },
  SUCCESS: {
    PRODUCT_CREATED: 'Product created successfully!',
    PRODUCT_UPDATED: 'Product updated successfully!',
    PRODUCT_ARCHIVED: 'Product archived successfully!',
    PRODUCT_UNARCHIVED: 'Product unarchived successfully!',
    PRODUCT_DELETED: 'Product deleted successfully!',
    MESSAGE_SENT: 'Message sent successfully!',
    GET_BACK_SOON: "We'll get back to you soon.",
  },
  EMPTY: {
    NO_PRODUCTS: 'No products found',
    NO_PRODUCTS_MESSAGE: 'Try adjusting your search or filter',
  },
} as const;

// ==================== ADMIN PANEL ====================
export const ADMIN = {
  TITLE: 'Admin Panel',
  SUBTITLE: 'Manage your products',
  TABS: {
    DASHBOARD: 'Dashboard',
    ADD_PRODUCT: 'Add Product',
    EDIT_PRODUCT: 'Edit Product',
    ADD_NEW_PRODUCT: 'Add New Product',
    PRODUCT_LIST: 'Product List',
    ARCHIVED: 'Archived',
    ANALYTICS: 'Analytics (Soon)',
  },
  MOBILE_TABS: {
    DASHBOARD: 'Dashboard',
    ADD: 'Add',
    LIST: 'List',
    ARCHIVED: 'Archived',
  },
  STATS: {
    TOTAL_PRODUCTS: 'Total Products',
    CATEGORIES: 'Categories',
    AVG_RATING: 'Avg Rating',
    PRODUCTS: 'products',
    CATEGORY_DISTRIBUTION: 'Category Distribution',
  },
  FORM: {
    CANCEL_EDIT: 'Cancel Edit',
    PRODUCT_NAME: 'Product Name *',
    TAGLINE: 'Tagline *',
    DESCRIPTION: 'Description *',
    IMAGE_URL: 'Image URL *',
    CATEGORY: 'Category *',
    AFFILIATE_LINK: 'Affiliate Link *',
    BADGE: 'Badge (Optional)',
    RATING: 'Rating (0-5) *',
    NO_BADGE: 'No Badge',
    LOADING_CATEGORIES: 'Loading categories...',
    CREATING: 'Creating...',
    UPDATING: 'Updating...',
    SAVE_PRODUCT: 'Save Product',
    UPDATE_PRODUCT: 'Update Product',
  },
  PLACEHOLDERS: {
    PRODUCT_NAME: 'Premium Wireless Headphones',
    TAGLINE: 'Studio-quality sound in a wireless package',
    DESCRIPTION: 'Detailed product description...',
    IMAGE_URL: 'https://your-bucket.s3.amazonaws.com/image.jpg',
    AFFILIATE_LINK: 'https://partner-store.com/product',
  },
  DIALOG: {
    ARCHIVE_TITLE: 'Archive Product',
    ARCHIVE_MESSAGE: 'Are you sure you want to archive this product? It will be moved to the archived section and hidden from the public store.',
    ARCHIVE_CONFIRM: 'Archive',
    ARCHIVE_CANCEL: 'Cancel',
    ARCHIVING: 'Archiving...',
    DELETE_TITLE: 'Confirm Delete',
    DELETE_MESSAGE: 'Are you sure you want to permanently delete this product? This action cannot be undone.',
    DELETE_CONFIRM: 'Delete',
    DELETE_CANCEL: 'Cancel',
    DELETING: 'Deleting...',
  },
  TABLE: {
    PRODUCT: 'Product',
    CATEGORY: 'Category',
    RATING: 'Rating',
    BADGE: 'Badge',
    ACTIONS: 'Actions',
    NO_PRODUCTS: 'No products found. Add your first product!',
    NO_ARCHIVED: 'No archived products found.',
    LOADING_PRODUCTS: 'Loading products...',
    LOADING_ARCHIVED: 'Loading archived products...',
    PRODUCT_LIST: 'Product List',
    ARCHIVED_PRODUCTS: 'Archived Products',
  },
  ACTIONS: {
    EDIT: 'Edit',
    ARCHIVE: 'Archive',
    UNARCHIVE: 'Unarchive',
    DELETE: 'Delete',
  },
  NOTES: {
    IMAGE_RECOMMENDED: '💡 Recommended: Square image (800x800px), JPEG/WebP format, max 5MB',
    IMAGE_WORKS: '✅ Works: AWS S3, Google Cloud Storage, Cloudinary, iStockphoto, Unsplash, Pexels, Imgur',
    IMAGE_WONT_WORK: '⚠️ Won\'t work: Pinterest, Google Drive, Dropbox (CORS restrictions)',
    IMAGE_EXAMPLES: 'Examples & More Info',
    IMAGE_PREVIEW: 'Preview:',
    IMAGE_NOT_FOUND: '❌ Image not accessible\nCheck URL or CORS',
    SOCIAL_MEDIA_NOTE: 'Manage product-specific social media links (Instagram, YouTube, Facebook, TikTok, etc.) directly in the Django Admin panel for this product.',
    SOCIAL_MEDIA_LINK: 'Go to Django Admin > Products > [This Product] to add/edit links.',
  },
} as const;

// ==================== ABOUT PAGE ====================
export const ABOUT = {
  TITLE: 'About Mr DSP Hub',
  SECTIONS: {
    WHO_WE_ARE: 'Who We Are',
    AFFILIATE_DISCLOSURE: 'Affiliate Transparency',
    OUR_COMMITMENT: 'What We Do',
    CONTACT_ME: 'Contact Me',
    GET_IN_TOUCH: 'Get in Touch',
    SEND_MESSAGE: 'Send a Message',
    BUSINESS_INQUIRIES: 'Business Inquiries',
    QUICK_LINKS: 'Quick Links',
    FOLLOW_US: 'Follow Us',
  },
  CONTENT: {
    WELCOME:
      'Welcome to Mr DSP Hub - your go-to platform for discovering premium products, honest reviews, and real deals.',
    MISSION:
      'We are passionate tech enthusiasts and product reviewers who test, analyze, and simplify products so you can make smart buying decisions without confusion.',
    TRUSTED_BY:
      'Trusted by viewers from our MrDspHub  community available in Instagram & YouTube',
    TRANSPARENCY: 'Transparency is important to us.',
    AFFILIATE_DISCLOSURE:
      'Some links on our website are affiliate links. This means we may earn a small commission if you purchase through them - at no extra cost to you.',
    AFFILIATE_INTEGRITY:
      'But here is our promise:',
    AFFILIATE_PROMISE_ITEMS: [
      'We never promote products just for commission',
      'Every recommendation is based on real testing or deep research',
    ],
    WHAT_WE_DO_ITEMS: [
      'In-depth product reviews (Ad vs Reality)',
      'Real-world testing & honest opinions',
      'Smart recommendations based on value',
      'Curated deals that actually matter',
    ],
    COMMITMENT: 'We focus on quality over hype - no fake promotions, only useful products.',
    COLLABORATIONS: "Let's Work Together",
    COLLABORATION_ITEMS: [
      'Brand collaborations & promotions',
      'Product reviews (Ad vs Reality testing)',
      'Affiliate partnerships',
      'Sponsored content & campaigns',
    ],
  },
  FORM: {
    NAME: 'Name *',
    EMAIL: 'Email *',
    SUBJECT: 'Subject *',
    MESSAGE: 'Message *',
    SELECT_SUBJECT: 'Select a subject',
    SENDING: 'Sending...',
    SEND_MESSAGE: 'Send Message',
  },
  PLACEHOLDERS: {
    NAME: 'Your name',
    EMAIL: 'your.email@example.com',
    MESSAGE: 'Tell us about your inquiry...',
  },
  SUBJECT_OPTIONS: {
    BRAND_PROMOTION: 'Brand Promotion',
    PRODUCT_REVIEW: 'Product Review Request',
    COLLABORATION: 'Business Collaboration',
    GENERAL: 'General Inquiry',
  },
  CONTACT: {
    EMAIL: 'Email',
    PHONE: 'Phone',
  },
} as const;

// ==================== PRODUCT DETAIL ====================
export const PRODUCT_DETAIL = {
  ABOUT_PRODUCT: 'About this product',
  BUY_NOW: 'Buy Now on Partner Site',
  REDIRECT_MESSAGE: "You'll be redirected to our partner's website",
  CREATOR_REVIEW: 'Creator Review',
  MORE_FROM: 'More from',
} as const;

// ==================== PAGINATION ====================
export const PAGINATION = {
  PREVIOUS: 'Previous',
  NEXT: 'Next',
} as const;

// ==================== FOOTER ====================
export const FOOTER = {
  COPYRIGHT: BRAND.FOOTER_COPYRIGHT,
  LEFT_BULLETS: '🔸 Premium Product Reviews 🔸 Smart Deals 🔸 Real Testing.',
  FOLLOW_US_TAGLINE: 'Join our community for product insights & deals',
  COPYRIGHT_LINE: '© 2026 Mr DSP Hub. All rights reserved.',
  BUILT_BY: 'Built with ❤️ by',
  BUILT_BY_LINK_TEXT: 'DSP Tech',
} as const;

// ==================== HEADER TOP BAR ====================
export const HEADER_TOP = {
  VISIT_SOCIAL: 'Visit our social pages',
} as const;
