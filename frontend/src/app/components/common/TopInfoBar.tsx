import React, { useState, useEffect } from 'react';
import { Mail, Phone } from 'lucide-react';
import { socialMediaApi, SocialMedia } from '../../services/api';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { normalizeArray } from '../../utils/arrayUtils';
import { HEADER_TOP } from '../../constants/strings';

export function TopInfoBar() {
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
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

  const email = siteSettings?.contact_email;
  const phone = siteSettings?.contact_phone;

  // Only show if we have email or phone from admin panel
  if (!email && !phone) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 border-b-2 border-cyan-500/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 py-1.5 sm:py-2">
          {/* Left Side - Email and Phone */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm">
            {/* Email */}
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                <span className="font-medium">{email}</span>
              </a>
            )}

            {/* Phone Number */}
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-cyan-400" />
                <span className="font-medium">{phone}</span>
              </a>
            )}
          </div>

          {/* Right Side - Social Media */}
          {socialMedia.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300 font-medium hidden sm:inline">
                {HEADER_TOP.VISIT_SOCIAL}
              </span>
              <div className="flex items-center gap-2">
                {socialMedia.map((social) => (
                  <a
                    key={social.id}
                    href={social.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded hover:opacity-80 transition-opacity"
                    title={social.name}
                  >
                    <img
                      src={social.icon_url}
                      alt={social.name}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.social-fallback')) {
                          const fallback = document.createElement('span');
                          fallback.className = 'social-fallback text-cyan-400 text-xs font-semibold';
                          fallback.textContent = social.name.charAt(0).toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
