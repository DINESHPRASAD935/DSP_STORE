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
  FOOTER_COPYRIGHT:
    '© 2026 MrDSP Hub. Some links are affiliate links; we may earn a commission at no extra cost to you.',
  DESCRIPTION:
    'Honest product reviews, tested picks, and curated deals — so you can shop with confidence.',
} as const;

// ==================== NAVIGATION ====================
export const NAV = {
  HOME: 'Home',
  ABOUT: 'About',
  BLOG: 'Blog',
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
    ANALYTICS: 'Analytics',
    BADGES: 'Badges',
    CATEGORIES: 'Categories',
  },
  MOBILE_TABS: {
    DASHBOARD: 'Dashboard',
    ADD: 'Add',
    LIST: 'List',
    ARCHIVED: 'Archived',
    ANALYTICS: 'Analytics',
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
    AFFILIATE_STORE_NAME: 'Partner store name (for Buy button notice)',
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
    AFFILIATE_STORE_NAME: 'Amazon',
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
    AFFILIATE_STORE_NAME:
      "Shown under the Buy button, e.g. you'll see: redirected to the Amazon website. Enter the marketplace name (Amazon, Flipkart, Meesho).",
  },
} as const;

// ==================== ABOUT PAGE ====================
export const ABOUT = {
  TITLE: 'About MrDSP Hub',
  SECTIONS: {
    WHO_WE_ARE: 'Who we are',
    AFFILIATE_DISCLOSURE: 'Affiliate transparency',
    OUR_COMMITMENT: 'What we do',
    CONTACT_ME: 'Contact',
    GET_IN_TOUCH: 'Get in touch',
    SEND_MESSAGE: 'Send a message',
    BUSINESS_INQUIRIES: 'Business inquiries',
    QUICK_LINKS: 'Quick links',
    FOLLOW_US: 'Follow us',
  },
  CONTENT: {
    WELCOME:
      'Welcome to MrDSP Hub — your place for premium product picks, honest reviews, and deals worth knowing about.',
    MISSION:
      'We are tech and product enthusiasts who test, compare, and explain what matters so you can decide faster, with less noise.',
    TRUSTED_BY:
      'Our community follows along on Instagram and YouTube for reviews, deals, and straight talk — no fluff.',
    CONTACT_INTRO:
      'Questions, feedback, or partnership ideas? Use the email or phone below. We read every message and reply when we can.',
    CONTACT_UNAVAILABLE:
      'Contact details are not set yet. Please try again later or use links in the site footer when available.',
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
  /** Shown when partner store name is not set on the product */
  REDIRECT_MESSAGE_FALLBACK: "You'll be redirected to our partner's website",
  CREATOR_REVIEW: 'Creator Review',
  MORE_FROM: 'More from',
} as const;

/** Line under the Buy button on the product page; uses per-product partner store when set. */
export function getProductRedirectMessage(affiliateStoreName?: string | null): string {
  const s = affiliateStoreName?.trim();
  if (!s) return PRODUCT_DETAIL.REDIRECT_MESSAGE_FALLBACK;
  return `You'll be redirected to the ${s} website.`;
}

// ==================== PAGINATION ====================
export const PAGINATION = {
  PREVIOUS: 'Previous',
  NEXT: 'Next',
} as const;

// ==================== FOOTER ====================
export const FOOTER = {
  COPYRIGHT: BRAND.FOOTER_COPYRIGHT,
  COPYRIGHT_LINE: '© 2026 MrDSP Hub. All rights reserved.',
  RIGHTS_RESERVED: 'All rights reserved.',
  BUILT_BY: 'Built with ❤️ by',
  BUILT_BY_LINK_TEXT: 'DSP Tech',
  /** Shown only when Site Settings description is empty */
  BRAND_INTRO: 'Product reviews and curated affiliate links.',
  /** Single line with diamond separators — brand highlights */
  LEFT_BULLETS: '🔸 Premium Product Reviews 🔸 Smart Deals 🔸 Giveaways.',
  TRUST_LINES: [
    'Trusted by 10K+ followers across YouTube & Instagram',
    'Amazon / affiliate partner — honest picks only',
    'Real testing videos — no hype',
  ] as const,
  CTA_TITLE: 'Never miss a deal',
  CTA_WHATSAPP: '🔥 Join WhatsApp deals (daily offers)',
  CTA_YOUTUBE: '🎥 Watch latest reviews',
  CTA_TELEGRAM: 'Best deals on Telegram',
  EXPLORE: 'Explore',
  LEGAL_GROUP: 'Legal',
  CONTACT_EMAIL_LABEL: 'Email us',
  CONTACT_PHONE_LABEL: 'Call us',
  LEGAL_PRIVACY: 'Privacy Policy',
  LEGAL_TERMS: 'Terms & Conditions',
  LEGAL_DISCLAIMER: 'Disclaimer',
} as const;

// ==================== LEGAL PAGES (/legal/:slug) ====================
export const LEGAL = {
  LAST_UPDATED_LABEL: 'Last updated',
  LAST_UPDATED: 'March 2026',
  PRIVACY: {
    TITLE: 'Privacy Policy',
    DESCRIPTION:
      'How MrDSP Hub handles information when you browse, read, or interact with our website.',
    SECTIONS: [
      {
        HEADING: 'Who we are',
        BODY:
          'MrDSP Hub (“we”, “us”) operates this website to share product reviews, deals, and related content. This policy explains what we collect and how we use it.',
      },
      {
        HEADING: 'Information we collect',
        BODY:
          'We may collect technical data such as pages viewed, approximate region, and device/browser type when analytics are enabled. If you email us or use contact details we publish, we receive whatever you choose to send. When you follow links to retailers or affiliate partners, those sites may use cookies or similar technologies under their own policies.',
      },
      {
        HEADING: 'Cookies and similar technologies',
        BODY:
          'We or our service providers may use cookies or local storage where needed for the site to function or to measure traffic. You can control cookies through your browser settings; blocking some cookies may affect how the site works.',
      },
      {
        HEADING: 'How we use information',
        BODY:
          'We use information to run and improve the site, respond to messages, fix issues, and understand what content is useful. We do not sell your personal information.',
      },
      {
        HEADING: 'Third-party sites',
        BODY:
          'We link to stores and services we do not control. Their terms and privacy policies apply there. Do not share payment or sensitive data with us by email unless we have agreed a secure channel.',
      },
      {
        HEADING: 'Data retention',
        BODY:
          'We keep information only as long as needed for the purposes above or as required by law. Contact records may be kept for a reasonable period to handle follow-up.',
      },
      {
        HEADING: 'Your choices',
        BODY:
          'You may request access to or correction of personal data we hold where applicable law requires it, by contacting us using the details on our About page.',
      },
      {
        HEADING: 'Changes to this policy',
        BODY:
          'We may update this policy from time to time. The “Last updated” date at the top will change when we do. Continued use of the site after changes means you accept the updated policy.',
      },
      {
        HEADING: 'Contact',
        BODY:
          'For privacy questions, contact us via the email or phone on our About page, or through any contact method shown in the site footer.',
      },
    ] as const,
  },
  TERMS: {
    TITLE: 'Terms & Conditions',
    DESCRIPTION: 'Rules for using the MrDSP Hub website and our content.',
    SECTIONS: [
      {
        HEADING: 'Agreement',
        BODY:
          'By using this website you agree to these terms. If you do not agree, please do not use the site.',
      },
      {
        HEADING: 'Use of the site',
        BODY:
          'Content is provided for general information. You must not misuse the site: no unlawful use, no attempt to break security, no scraping or automated access that harms performance, and no interference with other users.',
      },
      {
        HEADING: 'Content and opinions',
        BODY:
          'Reviews, ratings, and opinions are ours (or clearly credited). Prices, availability, and specifications change; always confirm on the retailer’s website before you purchase.',
      },
      {
        HEADING: 'Intellectual property',
        BODY:
          'Text, graphics, logos, and layout on this site are owned by us or used with permission. You may not copy, redistribute, or reuse them for commercial purposes without our written consent, except as allowed by law for personal, non-commercial use.',
      },
      {
        HEADING: 'Limitation of liability',
        BODY:
          'To the fullest extent permitted by law, we are not liable for any indirect, incidental, or consequential loss from using the site or relying on its content. Your use of third-party sites and products is at your own risk.',
      },
      {
        HEADING: 'Changes',
        BODY:
          'We may change these terms or the site. The updated terms apply when posted. Check this page periodically.',
      },
    ] as const,
  },
  DISCLAIMER: {
    TITLE: 'Disclaimer',
    DESCRIPTION: 'Please read this alongside our Terms and Privacy Policy.',
    SECTIONS: [
      {
        HEADING: 'Affiliate relationships',
        BODY:
          'MrDSP Hub may earn a commission when you purchase through some links on this site, at no extra cost to you. We only recommend products we believe are worth considering; compensation does not change our editorial standards.',
      },
      {
        HEADING: 'No warranty',
        BODY:
          'We aim for accurate, up-to-date information but make no warranty that content is complete, current, or error-free. Retailers set final prices, stock, and terms.',
      },
      {
        HEADING: 'Results and suitability',
        BODY:
          'Product performance varies by use case. Your experience may differ from ours or from marketing claims. Always read the seller’s description and return policy.',
      },
      {
        HEADING: 'Not professional advice',
        BODY:
          'Nothing on this site is financial, legal, tax, or medical advice. For decisions in those areas, consult a qualified professional.',
      },
    ] as const,
  },
} as const;

// ==================== HEADER TOP BAR ====================
export const HEADER_TOP = {
  VISIT_SOCIAL: 'Visit our social pages',
} as const;
