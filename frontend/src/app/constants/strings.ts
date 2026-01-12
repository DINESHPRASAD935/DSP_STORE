/**
 * Application-wide string constants
 * Centralized location for all user-facing text
 * Makes it easier to maintain, update, and prepare for internationalization
 */

// ==================== BRANDING ====================
export const BRAND = {
  NAME: 'MrDSP Hub',
  TAGLINE: 'Premium Picks',
  LOGO_ALT: 'MrDSP Hub Logo',
  FOOTER_COPYRIGHT: '© 2026 MrDSP Hub. All affiliate links are for demonstration purposes.',
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
    BACKEND_NOT_RUNNING: 'Make sure the Django backend is running on http://localhost:8000',
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
  TITLE: 'About MrDSP Hub',
  SECTIONS: {
    WHO_WE_ARE: 'Who We Are',
    AFFILIATE_DISCLOSURE: 'Affiliate Disclosure',
    OUR_COMMITMENT: 'Our Commitment',
    CONTACT_ME: 'Contact Me',
    GET_IN_TOUCH: 'Get in Touch',
    SEND_MESSAGE: 'Send a Message',
    BUSINESS_INQUIRIES: 'Business Inquiries',
    QUICK_LINKS: 'Quick Links',
    FOLLOW_US: 'Follow Us',
  },
  CONTENT: {
    WELCOME: 'Welcome to MrDSP Hub, your trusted destination for discovering premium products and exclusive deals. We are passionate creators and reviewers dedicated to bringing you honest, in-depth reviews of the best products available in the market.',
    MISSION: 'Our mission is to help you make informed purchasing decisions by providing detailed product information, real-world testing, and authentic reviews. We carefully curate each product to ensure quality and value for our community.',
    TRANSPARENCY: 'Transparency is important to us.',
    AFFILIATE_DISCLOSURE: 'Some of the links on this website are affiliate links, which means we may earn a commission if you make a purchase through these links. This comes at no additional cost to you and helps us maintain and improve our content.',
    AFFILIATE_INTEGRITY: 'We only recommend products that we genuinely believe in and have either tested ourselves or thoroughly researched. Our reviews are based on honest assessments, and affiliate relationships do not influence our opinions or recommendations.',
    COMMITMENT: 'We are committed to providing you with accurate, up-to-date information and maintaining the highest standards of integrity in all our content. Your trust is our most valuable asset, and we work hard to earn and maintain it every day.',
    COLLABORATIONS: "We're open to collaborations for:",
    COLLABORATION_ITEMS: [
      'Brand promotions and partnerships',
      'Product review requests',
      'Business collaborations',
      'Sponsored content opportunities',
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
} as const;

// ==================== HEADER TOP BAR ====================
export const HEADER_TOP = {
  VISIT_SOCIAL: 'Visit our social pages',
} as const;
