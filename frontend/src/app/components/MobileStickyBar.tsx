import { ExternalLink, Instagram, MessageCircle } from 'lucide-react';

type MobileStickyBarProps = {
  productUrl: string;
  whatsappUrl?: string | null;
  followUrl?: string | null;
};

export function MobileStickyBar({ productUrl, whatsappUrl, followUrl }: MobileStickyBarProps) {
  const whatsappDisabled = !whatsappUrl;
  const followDisabled = !followUrl;

  return (
    <aside className="fixed bottom-0 inset-x-0 z-50 border-t border-gray-700/60 bg-gray-950/95 backdrop-blur px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] md:hidden">
      <div className="grid grid-cols-3 gap-2">
        <a
          href={productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[46px] rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium inline-flex items-center justify-center gap-1.5 touch-manipulation"
        >
          View Product
          <ExternalLink className="w-4 h-4" />
        </a>
        <a
          href={whatsappUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`min-h-[46px] rounded-xl bg-gray-800 text-gray-100 text-sm font-medium inline-flex items-center justify-center gap-1.5 border border-gray-700 touch-manipulation ${
            whatsappDisabled ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          WhatsApp
          <MessageCircle className="w-4 h-4" />
        </a>
        <a
          href={followUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`min-h-[46px] rounded-xl bg-gray-800 text-gray-100 text-sm font-medium inline-flex items-center justify-center gap-1.5 border border-gray-700 touch-manipulation ${
            followDisabled ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          Follow
          <Instagram className="w-4 h-4" />
        </a>
      </div>
    </aside>
  );
}

