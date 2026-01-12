import { useState, useEffect } from 'react';
import { siteSettingsApi, SiteSettings } from '../services/api';

const DEFAULT_SETTINGS: SiteSettings = {
  brand_name: 'MrDSP Hub',
  tagline: 'Premium Picks',
  description: 'Your trusted destination for premium product reviews and exclusive deals.',
  logo_url: null,
  footer_logo_url: null,
  copyright_text: 'All Rights Reserved.',
  developer_credit: '',
  developer_credit_url: null,
  contact_email: 'contact@mrdsphub.com',
  contact_phone: '+91 9876543210',
  operating_hours: '07:00 AM - 07:00 PM',
  whatsapp_url: null,
  page_size: 30,
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await siteSettingsApi.get();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching site settings:', err);
        setError('Failed to load site settings');
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { siteSettings: settings, loading, error };
}
