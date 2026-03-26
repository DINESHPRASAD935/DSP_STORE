import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUp,
  Mail,
  Phone,
  Home,
  CircleUserRound,
  BookOpen,
  Shield,
  Scale,
  AlertCircle,
} from 'lucide-react';
import { socialMediaApi, SocialMedia } from '../../services/api';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { NAV, ABOUT, FOOTER } from '../../constants/strings';
import { normalizeArray } from '../../utils/arrayUtils';

export function Footer() {
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { siteSettings } = useSiteSettings();

  useEffect(() => {
    const fetchSocialMedia = async () => {
      try {
        const data = await socialMediaApi.getAll();
        setSocialMedia(normalizeArray(data));
      } catch (err) {
        console.error('Error fetching social media:', err);
        setSocialMedia([]);
      }
    };
    fetchSocialMedia();
  }, []);

  // Handle scroll to show/hide scroll-to-top button and calculate scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;
      
      // Show button when scrolled more than 300px
      setShowScrollTop(scrollY > 300);
      
      // Calculate scroll progress (0-100%)
      if (maxScroll > 0) {
        const progress = Math.min(100, (scrollY / maxScroll) * 100);
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
    };
    
    // Initial calculation
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper function to get SVG icon for a social media platform (for footer section)
  // Returns SVG icon if available, otherwise returns null to use API icon_url
  const getSocialMediaSVGIcon = (platformName: string): React.ReactElement | null => {
    const name = platformName.toLowerCase();
    
    // Instagram
    if (name.includes('instagram')) {
      return (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    }
    
    // Facebook
    if (name.includes('facebook') || name === 'fb') {
      return (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    }
    
    // YouTube
    if (name.includes('youtube')) {
      return (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    }
    
    // Twitter/X
    if (name.includes('twitter') || name === 'x' || name.includes('x.com')) {
      return (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    }
    
    // WhatsApp
    if (name.includes('whatsapp')) {
      return (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      );
    }
    
    // LinkedIn
    if (name.includes('linkedin')) {
      return (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    }
    
    // TikTok
    if (name.includes('tiktok')) {
      return (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      );
    }
    
    // Pinterest
    if (name.includes('pinterest')) {
      return (
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
        </svg>
      );
    }
    
    // No SVG available for this platform
    return null;
  };

  const getSocialMedia = (platformNames: string[]): SocialMedia | null => {
    for (const name of platformNames) {
      const social = socialMedia.find((s) => s.name.toLowerCase() === name.toLowerCase());
      if (social) return social;
    }
    return null;
  };

  const findSocialByPartial = (substring: string): SocialMedia | null => {
    const q = substring.toLowerCase();
    return socialMedia.find((s) => s.name.toLowerCase().includes(q)) ?? null;
  };

  const youtubeForCta =
    getSocialMedia(['YouTube', 'Youtube']) ?? findSocialByPartial('youtube');
  const telegramUrl =
    findSocialByPartial('telegram')?.profile_url ||
    (typeof import.meta.env.VITE_TELEGRAM_URL === 'string' && import.meta.env.VITE_TELEGRAM_URL) ||
    null;

  /** WhatsApp channel for footer CTAs + social grid — from Social Media (Django), not Site Settings */
  const whatsappChannelSocial =
    getSocialMedia(['WhatsApp', 'WhatsApp Channel', 'WA Channel']) ?? findSocialByPartial('whatsapp');

  type CtaItem = { href: string; label: string; kind: 'whatsapp' | 'youtube' | 'telegram' };
  const ctaItems: CtaItem[] = [];
  if (whatsappChannelSocial?.profile_url) {
    ctaItems.push({
      href: whatsappChannelSocial.profile_url,
      label: FOOTER.CTA_WHATSAPP,
      kind: 'whatsapp',
    });
  }
  if (youtubeForCta?.profile_url) {
    ctaItems.push({ href: youtubeForCta.profile_url, label: FOOTER.CTA_YOUTUBE, kind: 'youtube' });
  }
  if (telegramUrl) {
    ctaItems.push({ href: telegramUrl, label: FOOTER.CTA_TELEGRAM, kind: 'telegram' });
  }

  /** Plain outlined CTAs — subtle border + faint fill, cyan text (matches “Never miss a deal” reference). */
  const ctaPlainLinkClass =
    'inline-flex w-full min-h-[40px] items-center justify-start rounded-xl border border-gray-600/45 bg-gray-950/35 px-3.5 py-2.5 text-left text-xs sm:text-sm font-normal text-cyan-300/95 leading-snug transition-colors duration-200 touch-manipulation hover:border-gray-500/55 hover:bg-gray-900/50 hover:text-cyan-200';

  const floatingSocialConfig = [
    {
      getUrl: () => (siteSettings?.contact_email ? `mailto:${siteSettings.contact_email}` : null),
      getTitle: () => 'Send us an email',
      getAriaLabel: () => 'Email',
      bgClass: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      icon: <Mail className="w-7 h-7 text-white" />,
      show: () => !!siteSettings?.contact_email,
    },
    {
      platformNames: ['Instagram'],
      getUrl: (social: SocialMedia | null) => social?.profile_url || null,
      getTitle: () => 'Follow us on Instagram',
      getAriaLabel: () => 'Instagram',
      bgClass: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600',
      icon: (
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      platformNames: ['Facebook', 'FB'],
      getUrl: (social: SocialMedia | null) => social?.profile_url || null,
      getTitle: () => 'Follow us on Facebook',
      getAriaLabel: () => 'Facebook',
      bgClass: 'bg-[#1877F2] hover:bg-[#166FE5]',
      icon: (
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      platformNames: ['YouTube', 'Youtube'],
      getUrl: (social: SocialMedia | null) => social?.profile_url || null,
      getTitle: () => 'Subscribe to our YouTube channel',
      getAriaLabel: () => 'YouTube',
      bgClass: 'bg-[#FF0000] hover:bg-[#E60000]',
      icon: (
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      platformNames: ['Twitter', 'X', 'x.com'],
      getUrl: (social: SocialMedia | null) => social?.profile_url || null,
      getTitle: () => 'Follow us on Twitter/X',
      getAriaLabel: () => 'Twitter',
      bgClass: 'bg-black hover:bg-gray-800',
      icon: (
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      /** Site Settings WhatsApp URL = vertical floating button only (e.g. direct chat). Channel/deals use Social Media → WhatsApp. */
      getUrl: () => siteSettings?.whatsapp_url || null,
      getTitle: () => 'WhatsApp',
      getAriaLabel: () => 'WhatsApp',
      bgClass: 'bg-[#25D366] hover:bg-[#20BA5A]',
      icon: (
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
      show: () => !!siteSettings?.whatsapp_url,
    },
  ];

  const getFloatingSocialButtons = () => {
    return floatingSocialConfig
      .map((config) => {
        let url: string | null = null;
        let social: SocialMedia | null = null;

        if ('platformNames' in config && config.platformNames) {
          social = getSocialMedia(config.platformNames);
          url = config.getUrl(social);
        } else {
          url = config.getUrl();
        }

        if (!url || (config.show && !config.show())) {
          return null;
        }

        const iconToUse = config.icon ? (
          config.icon
        ) : social?.icon_url ? (
          <img
            src={social.icon_url}
            alt={config.getAriaLabel()}
            className="w-8 h-8 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="text-white text-xs font-semibold">{config.getAriaLabel().charAt(0)}</span>
        );

        return {
          url,
          title: config.getTitle(),
          ariaLabel: config.getAriaLabel(),
          isEmail: config.getAriaLabel().toLowerCase() === 'email',
          bgClass: config.bgClass,
          icon: iconToUse,
          isExternal:
            !!('platformNames' in config && config.platformNames) ||
            config.getAriaLabel?.() === 'WhatsApp',
        };
      })
      .filter((button): button is NonNullable<typeof button> => button !== null);
  };

  return (
    <>
    <footer className="relative bg-gray-900/95 backdrop-blur-sm border-t border-gray-800/50 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Mobile: stacked with spacing; lg: auto + 1fr + 1fr */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] gap-y-5 gap-x-6 lg:gap-x-8 lg:gap-y-6 lg:justify-items-start">
          {/* Brand */}
          <div className="space-y-2 min-w-0 max-w-md xl:max-w-lg max-lg:pb-6 max-lg:border-b border-gray-800/40 lg:border-b-0 lg:pb-0">
            <div>
              <h3 className="text-white font-semibold text-base leading-tight">
                {siteSettings?.brand_name || 'MrDSP Hub'}
              </h3>
              {siteSettings?.tagline && (
                <p className="text-gray-400 text-xs mt-0.5">{siteSettings.tagline}</p>
              )}
            </div>
            <p className="text-gray-300 text-sm leading-snug">
              {siteSettings?.description || FOOTER.BRAND_INTRO}
            </p>
            <p className="text-gray-400 text-xs leading-snug">{FOOTER.LEFT_BULLETS}</p>
            <ul className="space-y-1 text-gray-400 text-xs leading-snug pt-0.5">
              {FOOTER.TRUST_LINES.map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-amber-400/90 shrink-0" aria-hidden>
                    ★
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            {(siteSettings?.contact_email || siteSettings?.contact_phone) && (
              <div className="flex flex-col gap-2 pt-1">
                {siteSettings?.contact_email && (
                  <a
                    href={`mailto:${siteSettings.contact_email}`}
                    className="group inline-flex flex-col justify-center gap-0.5 rounded-lg border border-transparent px-1 py-0.5 -mx-1 text-sm text-cyan-400 transition-colors hover:border-cyan-500/20 hover:bg-cyan-950/20"
                  >
                    <span className="text-[10px] uppercase tracking-wide text-gray-500 group-hover:text-gray-400">
                      {FOOTER.CONTACT_EMAIL_LABEL}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-cyan-400">
                      <Mail className="w-4 h-4 shrink-0" />
                      {siteSettings.contact_email}
                    </span>
                  </a>
                )}
                {siteSettings?.contact_phone && (
                  <a
                    href={`tel:${siteSettings.contact_phone.replace(/\s/g, '')}`}
                    className="group inline-flex flex-col justify-center gap-0.5 rounded-lg border border-transparent px-1 py-0.5 -mx-1 text-sm text-cyan-400 transition-colors hover:border-cyan-500/20 hover:bg-cyan-950/20"
                  >
                    <span className="text-[10px] uppercase tracking-wide text-gray-500 group-hover:text-gray-400">
                      {FOOTER.CONTACT_PHONE_LABEL}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-cyan-400">
                      <Phone className="w-4 h-4 shrink-0" />
                      {siteSettings.contact_phone}
                    </span>
                  </a>
                )}
              </div>
            )}
          </div>

          <nav className="min-w-0 w-full max-lg:pb-6 max-lg:border-b border-gray-800/40 lg:border-b-0 lg:pb-0">
            <h4 className="text-white font-semibold text-sm mb-2">{ABOUT.SECTIONS.QUICK_LINKS}</h4>
            <div className="space-y-2">
              <div>
                <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-1">
                  {FOOTER.EXPLORE}
                </p>
                <ul className="space-y-0.5">
                  <li>
                    <Link
                      to="/"
                      className="group flex items-center gap-2 rounded-md px-1 py-1.5 -mx-1 text-sm text-gray-300 transition-colors hover:bg-gray-800/40 hover:text-cyan-400 hover:underline hover:underline-offset-2"
                    >
                      <Home className="h-4 w-4 shrink-0 text-gray-500 group-hover:text-cyan-400" aria-hidden />
                      {NAV.HOME}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/blog"
                      className="group flex items-center gap-2 rounded-md px-1 py-1.5 -mx-1 text-sm text-gray-300 transition-colors hover:bg-gray-800/40 hover:text-cyan-400 hover:underline hover:underline-offset-2"
                    >
                      <BookOpen className="h-4 w-4 shrink-0 text-gray-500 group-hover:text-cyan-400" aria-hidden />
                      {NAV.BLOG}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      className="group flex items-center gap-2 rounded-md px-1 py-1.5 -mx-1 text-sm text-gray-300 transition-colors hover:bg-gray-800/40 hover:text-cyan-400 hover:underline hover:underline-offset-2"
                    >
                      <CircleUserRound className="h-4 w-4 shrink-0 text-gray-500 group-hover:text-cyan-400" aria-hidden />
                      {NAV.ABOUT}
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-1">
                  {FOOTER.LEGAL_GROUP}
                </p>
                <ul className="space-y-0.5">
                  <li>
                    <Link
                      to="/legal/privacy"
                      className="group flex items-center gap-2 rounded-md px-1 py-1.5 -mx-1 text-sm text-gray-300 transition-colors hover:bg-gray-800/40 hover:text-cyan-400 hover:underline hover:underline-offset-2"
                    >
                      <Shield className="h-4 w-4 shrink-0 text-gray-500 group-hover:text-cyan-400" aria-hidden />
                      {FOOTER.LEGAL_PRIVACY}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/legal/terms"
                      className="group flex items-center gap-2 rounded-md px-1 py-1.5 -mx-1 text-sm text-gray-300 transition-colors hover:bg-gray-800/40 hover:text-cyan-400 hover:underline hover:underline-offset-2"
                    >
                      <Scale className="h-4 w-4 shrink-0 text-gray-500 group-hover:text-cyan-400" aria-hidden />
                      {FOOTER.LEGAL_TERMS}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/legal/disclaimer"
                      className="group flex items-center gap-2 rounded-md px-1 py-1.5 -mx-1 text-sm text-gray-300 transition-colors hover:bg-gray-800/40 hover:text-cyan-400 hover:underline hover:underline-offset-2"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 text-gray-500 group-hover:text-cyan-400" aria-hidden />
                      {FOOTER.LEGAL_DISCLAIMER}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          {/* External link buttons + social */}
          <div className="space-y-3 max-lg:pb-1">
            {ctaItems.length > 0 && (
              <div>
                <h4 className="text-white font-semibold text-sm mb-2">{FOOTER.CTA_TITLE}</h4>
                <div className="flex flex-col gap-2">
                  {ctaItems.map((item) => (
                    <a
                      key={item.href + item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={ctaPlainLinkClass}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className={ctaItems.length > 0 ? 'pt-2 border-t border-gray-800/50' : ''}>
            <h4 className="text-white font-semibold text-sm mb-2">{ABOUT.SECTIONS.FOLLOW_US}</h4>
            {socialMedia.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {socialMedia.map((social) => {
                  const svgIcon = getSocialMediaSVGIcon(social.name);
                  return (
                    <a
                      key={social.id}
                      href={social.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 sm:h-9 sm:w-9 rounded-lg bg-gray-800/60 border border-gray-700/50 hover:border-cyan-500/50 hover:bg-gray-800/90 flex items-center justify-center group transition-all duration-200 hover:scale-105 active:scale-95"
                      title={social.name}
                    >
                      {svgIcon ? (
                        <span className="text-gray-300 group-hover:text-cyan-400 [&_svg]:w-5 [&_svg]:h-5">
                          {svgIcon}
                        </span>
                      ) : social.icon_url ? (
                        <img
                          src={social.icon_url}
                          alt={social.name}
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-gray-400 text-xs font-semibold">
                          {social.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-xs">No social links configured.</p>
            )}
            </div>
          </div>
        </div>
      </div>

        {/* Bottom bar — copyright only */}
      <div className="bg-gray-900 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
          <p className="text-gray-500 text-xs sm:text-sm text-center">
            © {new Date().getFullYear()} {siteSettings?.brand_name || 'MrDSP Hub'}.{' '}
            {FOOTER.RIGHTS_RESERVED}{' '}
            {FOOTER.BUILT_BY}{' '}
            {siteSettings?.developer_credit_url ? (
              <a
                href={siteSettings.developer_credit_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                {siteSettings?.developer_credit || FOOTER.BUILT_BY_LINK_TEXT}
              </a>
            ) : (
              <span>{siteSettings?.developer_credit || FOOTER.BUILT_BY_LINK_TEXT}</span>
            )}
          </p>
        </div>
      </div>
      </footer>

      {/* Left edge shortcuts — laptop/desktop only */}
      <div className="fixed left-6 z-50 hidden lg:flex flex-col gap-3 bottom-6">
        {getFloatingSocialButtons().map((button, index) => (
          <a
            key={index}
            href={button.url}
            {...(button.isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
            className={`w-14 h-14 rounded-full ${button.bgClass} transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 touch-manipulation`}
            title={button.title}
            aria-label={button.ariaLabel}
          >
            {button.icon}
          </a>
        ))}
      </div>

      {/* Floating Scroll to Top Button - Bottom Right (laptop/desktop only) */}
              {showScrollTop && (
        <div className="fixed right-6 z-50 bottom-6 hidden lg:block">
          <div className="relative w-16 h-16">
            {/* Circular Progress Indicator */}
            <svg
              className="absolute inset-0 w-16 h-16 transform -rotate-90"
              viewBox="0 0 64 64"
            >
              {/* Background Circle */}
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="rgba(220, 38, 38, 0.2)"
                strokeWidth="4"
              />
              {/* Progress Circle */}
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#dc2626"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - scrollProgress / 100)}`}
                className="transition-[stroke-dashoffset] duration-300 ease-out"
              />
            </svg>
            
            {/* Button */}
                <button
                  onClick={scrollToTop}
              className="absolute inset-0 w-14 h-14 rounded-full bg-white border-2 border-red-600 hover:bg-gray-100 transition-all duration-500 ease-out flex items-center justify-center shadow-lg shadow-red-600/35 hover:shadow-xl hover:shadow-red-500/45 hover:scale-110 m-auto"
                  title="Scroll to top"
                  aria-label="Scroll to top"
                >
              <ArrowUp className="w-7 h-7 text-red-600" />
                </button>
          </div>
        </div>
      )}
    </>
  );
}
