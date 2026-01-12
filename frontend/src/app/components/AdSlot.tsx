import React from 'react';

interface AdSlotProps {
  type?: 'horizontal' | 'native';
  provider?: 'adsense' | 'custom' | 'placeholder';
  className?: string;
}

/**
 * Check if ads are configured and should be displayed
 */
export function hasAdsConfigured(): boolean {
  const envProvider = import.meta.env.VITE_AD_PROVIDER_TYPE || 'placeholder';
  const adProviderKey = import.meta.env.VITE_AD_PROVIDER_KEY || '';
  const adSlotId = import.meta.env.VITE_AD_SLOT_ID || '';
  
  // Only return true if a real ad provider is configured with keys
  if (envProvider === 'adsense' && adProviderKey && adSlotId) {
    return true;
  }
  
  // Custom provider would need its own check
  if (envProvider === 'custom') {
    // Add your custom ad check logic here
    return false; // Hide by default until custom ads are implemented
  }
  
  return false; // Placeholder or no ads configured
}

/**
 * Reusable AdSlot component for displaying advertisements
 * Supports multiple ad providers and types
 * 
 * @param type - Ad display type: 'horizontal' (full-width bar) or 'native' (inline)
 * @param provider - Ad provider: 'adsense', 'custom', or 'placeholder'
 * @param className - Additional CSS classes
 */
export function AdSlot({ type = 'horizontal', provider: propProvider, className = '' }: AdSlotProps) {
  // Get ad provider configuration from environment
  const envProvider = import.meta.env.VITE_AD_PROVIDER_TYPE || 'placeholder';
  const provider = propProvider || envProvider;
  const adProviderKey = import.meta.env.VITE_AD_PROVIDER_KEY || '';
  const adSlotId = import.meta.env.VITE_AD_SLOT_ID || '';

  // Fixed height to prevent layout shift
  const height = type === 'horizontal' ? '120px' : '250px';

  // Hide placeholder ads - only show real ads
  if (provider === 'placeholder') {
    return null;
  }

  // Google AdSense - only show if keys are configured
  if (provider === 'adsense') {
    if (!adProviderKey || !adSlotId) {
      return null; // Hide if keys are not configured
    }
    return (
      <div 
        className={`w-full ${className}`}
        style={{ minHeight: height }}
      >
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minHeight: height }}
          data-ad-client={adProviderKey}
          data-ad-slot={adSlotId}
          data-ad-format={type === 'horizontal' ? 'horizontal' : 'auto'}
          data-full-width-responsive="true"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (adsbygoogle = window.adsbygoogle || []).push({});
            `,
          }}
        />
      </div>
    );
  }

  // Custom ad provider - hide by default (implement your custom ad logic here)
  if (provider === 'custom') {
    // Return null to hide custom ads until properly implemented
    // Uncomment and implement your custom ad code when ready:
    // return (
    //   <div className={`w-full ${className}`} style={{ minHeight: height }}>
    //     {/* Your custom ad code here */}
    //   </div>
    // );
    return null;
  }

  // Default: Hide if no valid provider
  return null;
}
