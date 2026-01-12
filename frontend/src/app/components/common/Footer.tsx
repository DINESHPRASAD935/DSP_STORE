import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Mail } from 'lucide-react';
import { socialMediaApi, SocialMedia } from '../../services/api';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { NAV, ABOUT } from '../../constants/strings';
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

  // Helper function to get social media by platform name (case-insensitive, supports aliases)
  const getSocialMedia = (platformNames: string[]): SocialMedia | null => {
    for (const name of platformNames) {
      const social = socialMedia.find(
        (s) => s.name.toLowerCase() === name.toLowerCase()
      );
      if (social) return social;
    }
    return null;
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

  /**
   * Configuration for floating social media buttons
   * 
   * HOW TO ADD A NEW SOCIAL MEDIA PLATFORM:
   * 
   * 1. For platforms that use the Social Media API (most platforms):
   *    - Add a new object to this array with:
   *      - platformNames: Array of possible names (e.g., ['LinkedIn', 'Linked In'])
   *      - getUrl: Function that receives the social media object and returns the URL
   *      - getTitle: Function that returns the button title
   *      - getAriaLabel: Function that returns the aria-label
   *      - bgClass: Tailwind CSS classes for background color
   *      - icon: JSX element with the SVG icon (or use icon_url from API)
   * 
   * 2. For special platforms that use SiteSettings (like Email, WhatsApp):
   *    - Add a new object without platformNames
   *    - Use getUrl() to get URL from siteSettings
   *    - Add a show() function to conditionally show the button
   * 
   * Example for LinkedIn:
   * {
   *   platformNames: ['LinkedIn', 'Linked In'],
   *   getUrl: (social: SocialMedia | null) => social?.profile_url || null,
   *   getTitle: () => 'Connect with us on LinkedIn',
   *   getAriaLabel: () => 'LinkedIn',
   *   bgClass: 'bg-[#0077B5] hover:bg-[#006399]',
   *   icon: (<svg>...</svg>), // SVG icon is preferred for better UI quality
   * }
   * 
   * Icon Priority:
   * 1. Hardcoded SVG icon (config.icon) - Always used if provided (best UI quality)
   * 2. API icon_url - Only used if no SVG is configured (for future platforms)
   * 3. First letter fallback - Used if no icon is available
   * 
   * The button will automatically appear when you add the platform in Django Admin
   * with a matching name (case-insensitive).
   */
  const floatingSocialConfig = [
    {
      // Email - special case, uses contact_email from SiteSettings
      getUrl: () => siteSettings?.contact_email ? `mailto:${siteSettings.contact_email}` : null,
      getTitle: () => 'Send us an email',
      getAriaLabel: () => 'Email',
      bgClass: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      icon: <Mail className="w-7 h-7 text-white" />,
      show: () => !!siteSettings?.contact_email,
    },
    {
      // Instagram
      platformNames: ['Instagram'],
      getUrl: (social: SocialMedia | null) => social?.profile_url || null,
      getTitle: () => 'Follow us on Instagram',
      getAriaLabel: () => 'Instagram',
      bgClass: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600',
      icon: (
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      // Facebook
      platformNames: ['Facebook', 'FB'],
      getUrl: (social: SocialMedia | null) => social?.profile_url || null,
      getTitle: () => 'Follow us on Facebook',
      getAriaLabel: () => 'Facebook',
      bgClass: 'bg-[#1877F2] hover:bg-[#166FE5]',
      icon: (
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      // YouTube
      platformNames: ['YouTube', 'Youtube'],
      getUrl: (social: SocialMedia | null) => social?.profile_url || null,
      getTitle: () => 'Subscribe to our YouTube channel',
      getAriaLabel: () => 'YouTube',
      bgClass: 'bg-[#FF0000] hover:bg-[#E60000]',
      icon: (
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
    {
      // Twitter/X
      platformNames: ['Twitter', 'X', 'x.com'],
      getUrl: (social: SocialMedia | null) => social?.profile_url || null,
      getTitle: () => 'Follow us on Twitter/X',
      getAriaLabel: () => 'Twitter',
      bgClass: 'bg-black hover:bg-gray-800',
      icon: (
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      // WhatsApp - special case, uses whatsapp_url from SiteSettings
      getUrl: () => siteSettings?.whatsapp_url || null,
      getTitle: () => 'Contact us on WhatsApp',
      getAriaLabel: () => 'WhatsApp',
      bgClass: 'bg-[#25D366] hover:bg-[#20BA5A]',
      icon: (
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ),
      show: () => !!siteSettings?.whatsapp_url,
    },
  ];

  // Get configured floating social media buttons
  const getFloatingSocialButtons = () => {
    return floatingSocialConfig
      .map((config) => {
        let url: string | null = null;
        let social: SocialMedia | null = null;

        if (config.platformNames) {
          // For platforms that use Social Media API
          social = getSocialMedia(config.platformNames);
          url = config.getUrl(social);
        } else {
          // For special cases (Email, WhatsApp) that use SiteSettings
          url = config.getUrl();
        }

        // Only show if URL exists and show() returns true (if defined)
        if (!url || (config.show && !config.show())) {
          return null;
        }

        // Priority: Use hardcoded SVG icon (better UI quality) if available
        // Only use API icon_url as fallback for platforms without SVG configured
        // If API icon fails to load, fallback to first letter of platform name
        const iconToUse = config.icon ? (
          // Use hardcoded SVG icon (preferred for better UI)
          config.icon
        ) : social?.icon_url ? (
          // Fallback: Use API icon_url only if no SVG is configured
          <img
            src={social.icon_url}
            alt={config.getAriaLabel()}
            className="w-8 h-8 object-contain"
            onError={(e) => {
              // Fallback: hide image and show first letter if icon fails
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.icon-fallback')) {
                const fallback = document.createElement('span');
                fallback.className = 'icon-fallback text-white text-xs font-semibold';
                fallback.textContent = config.getAriaLabel().charAt(0);
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          // Final fallback: Show first letter if no icon available
          <span className="text-white text-xs font-semibold">
            {config.getAriaLabel().charAt(0)}
          </span>
        );

        return {
          url,
          title: config.getTitle(),
          ariaLabel: config.getAriaLabel(),
          bgClass: config.bgClass,
          icon: iconToUse,
          isExternal: !!config.platformNames || !!siteSettings?.whatsapp_url, // Email doesn't need target="_blank"
        };
      })
      .filter((button): button is NonNullable<typeof button> => button !== null);
  };

  // Footer uses footer_logo_url from settings, or logo_url, or env vars as fallback
  const footerLogoUrl = siteSettings?.footer_logo_url 
    || siteSettings?.logo_url
    || (import.meta as { env?: { VITE_FOOTER_LOGO_URL?: string } }).env?.VITE_FOOTER_LOGO_URL 
    || (import.meta as { env?: { VITE_LOGO_URL?: string } }).env?.VITE_LOGO_URL;

  return (
    <>
    <footer className="relative bg-gray-900/95 backdrop-blur-sm border-t border-gray-800/50 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="mb-4">
              <div className="h-16 lg:h-20 w-auto flex items-center justify-start overflow-hidden">
                {footerLogoUrl ? (
                  <img 
                    src={footerLogoUrl}
                    alt={`${siteSettings?.brand_name || 'Logo'} Logo`} 
                    className="h-full w-auto object-contain max-h-20"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.logo-fallback')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'logo-fallback flex items-center gap-3';
                        const brandName = siteSettings?.brand_name || 'Brand';
                        const tagline = siteSettings?.tagline || '';
                        fallback.innerHTML = `
                          <div class="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
                            <span class="text-white text-xl font-bold">${brandName.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <h3 class="text-lg text-white font-semibold">${brandName}</h3>
                            ${tagline ? `<p class="text-xs text-gray-400">${tagline}</p>` : ''}
                          </div>
                        `;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {(siteSettings?.brand_name || 'Brand').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg text-white font-semibold">{siteSettings?.brand_name || 'Brand'}</h3>
                      {siteSettings?.tagline && (
                        <p className="text-xs text-gray-400">{siteSettings.tagline}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {siteSettings?.description && (
              <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
                {siteSettings.description}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base lg:text-lg mb-5 lg:mb-6">{ABOUT.SECTIONS.QUICK_LINKS}</h4>
            <ul className="space-y-2.5">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-cyan-400 transition-colors duration-200 text-sm lg:text-base inline-block"
                >
                  {NAV.HOME}
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-cyan-400 transition-colors duration-200 text-sm lg:text-base inline-block"
                >
                  {NAV.ABOUT}
                </Link>
              </li>
              {siteSettings?.contact_email && (
                <li>
                  <a 
                    href={`mailto:${siteSettings.contact_email}`} 
                    className="text-gray-300 hover:text-cyan-400 transition-colors duration-200 text-sm lg:text-base inline-block"
                  >
                    {NAV.CONTACT}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Social Media */}
          {socialMedia.length > 0 && (
            <div>
              <h4 className="text-white font-bold text-base lg:text-lg mb-5 lg:mb-6">{ABOUT.SECTIONS.FOLLOW_US}</h4>
              <div className="flex flex-wrap gap-3">
                {socialMedia.map((social) => {
                  // Priority: Use SVG icon if available, otherwise use API icon_url
                  const svgIcon = getSocialMediaSVGIcon(social.name);
                  
                  return (
                  <a
                    key={social.id}
                    href={social.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 lg:w-12 lg:h-12 rounded-lg bg-gray-800/60 border border-gray-700/50 hover:border-cyan-500/50 hover:bg-gray-800/80 transition-all duration-200 flex items-center justify-center group"
                    title={social.name}
                  >
                      {svgIcon ? (
                        // Use SVG icon (preferred for better UI quality)
                        <span className="text-gray-300 group-hover:text-cyan-400 transition-colors">
                          {svgIcon}
                        </span>
                      ) : social.icon_url ? (
                        // Fallback: Use API icon_url if no SVG is available
                    <img
                      src={social.icon_url}
                      alt={social.name}
                      className="w-5 h-5 lg:w-6 lg:h-6 object-contain group-hover:scale-110 transition-transform duration-200"
                      onError={(e) => {
                            // Final fallback: Show first letter if image fails
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.social-fallback')) {
                          const fallback = document.createElement('span');
                          fallback.className = 'social-fallback text-gray-400 text-xs font-semibold group-hover:text-cyan-400 transition-colors';
                          fallback.textContent = social.name.charAt(0).toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                      ) : (
                        // Final fallback: Show first letter if no icon available
                        <span className="text-gray-400 text-xs font-semibold group-hover:text-cyan-400 transition-colors">
                          {social.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                  </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Bottom Bar - Copyright Only */}
      <div className="bg-gray-900 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-3 sm:py-4">
            {/* Center - Copyright */}
              <div className="text-center">
              <p className="text-gray-400 text-xs sm:text-sm">
                {siteSettings?.brand_name || 'Brand'} {siteSettings?.copyright_text || 'All Rights Reserved.'}
                {siteSettings?.developer_credit && (
                  <>
                    {' '}Developed By{' '}
                    {siteSettings.developer_credit_url ? (
                      <a 
                        href={siteSettings.developer_credit_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-cyan-400 hover:underline"
                      >
                        {siteSettings.developer_credit}
                      </a>
                    ) : (
                      <span>{siteSettings.developer_credit}</span>
                    )}
                  </>
                )}
              </p>
            </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Social Media Buttons - Left Side (Always Visible) */}
      {/* Only shows buttons for configured social media platforms */}
      <div className="fixed left-6 bottom-6 z-50 flex flex-col gap-3">
        {getFloatingSocialButtons().map((button, index) => (
          <a
            key={index}
            href={button.url}
            {...(button.isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
            className={`w-14 h-14 rounded-full ${button.bgClass} transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110`}
            title={button.title}
            aria-label={button.ariaLabel}
          >
            {button.icon}
          </a>
        ))}
            </div>

      {/* Floating Scroll to Top Button - Bottom Right (Always Visible When Scrolled) */}
              {showScrollTop && (
        <div className="fixed bottom-6 right-6 z-50">
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
                className="transition-all duration-150 ease-out"
              />
            </svg>
            
            {/* Button */}
                <button
                  onClick={scrollToTop}
              className="absolute inset-0 w-14 h-14 rounded-full bg-white border-2 border-red-600 hover:bg-gray-100 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 m-auto"
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
