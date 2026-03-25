/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_LOGO_URL?: string;
  readonly VITE_PAGE_SIZE?: string;
  readonly VITE_AD_PROVIDER_KEY?: string;
  readonly VITE_AD_SLOT_ID?: string;
  readonly VITE_AD_PROVIDER_TYPE?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_ENABLE_CHATBOT?: string;
  readonly VITE_DEBUG?: string;
  /** Optional Telegram channel/group URL when not configured as Social Media in admin */
  readonly VITE_TELEGRAM_URL?: string;
  // Note: VITE_CONTACT_EMAIL and VITE_CONTACT_PHONE are now managed via Django Admin Panel
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
