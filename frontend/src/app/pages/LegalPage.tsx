import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '../components/common/Footer';
import { Seo } from '../components/Seo';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { LEGAL, NAV } from '../constants/strings';

const LEGAL_SLUGS = ['privacy', 'terms', 'disclaimer'] as const;
type LegalSlug = (typeof LEGAL_SLUGS)[number];

function isLegalSlug(s: string | undefined): s is LegalSlug {
  return !!s && LEGAL_SLUGS.includes(s as LegalSlug);
}

export function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const { siteSettings } = useSiteSettings();

  if (!isLegalSlug(slug)) {
    return <Navigate to="/" replace />;
  }

  const page =
    slug === 'privacy' ? LEGAL.PRIVACY : slug === 'terms' ? LEGAL.TERMS : LEGAL.DISCLAIMER;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex flex-col">
      <Seo
        title={`${page.TITLE} | ${siteSettings.brand_name}`}
        description={page.DESCRIPTION}
        path={`/legal/${slug}`}
        siteName={siteSettings.brand_name}
      />

      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {NAV.BACK_TO_STORE}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 w-full">
        <p className="text-gray-500 text-xs mb-2">
          {LEGAL.LAST_UPDATED_LABEL}: {LEGAL.LAST_UPDATED}
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">{page.TITLE}</h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">{page.DESCRIPTION}</p>

        <div className="space-y-8">
          {page.SECTIONS.map((section, i) => (
            <section key={i}>
              <h2 className="text-white font-medium text-lg mb-2">{section.HEADING}</h2>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                {section.BODY}
              </p>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
