import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { AdSlot, hasAdsConfigured } from '../components/AdSlot';
import { Footer } from '../components/common/Footer';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { createInputHandler } from '../utils/formUtils';
import { contactApi } from '../services/api';
import { NAV, ABOUT, MESSAGES } from '../constants/strings';
import { Seo } from '../components/Seo';
import { toast } from 'sonner';

export function AboutPage() {
  // Permanently disable the contact form UI ("Send a Message") per UX request.
  // We still keep the contact information (email/phone + business inquiries).
  const showContactForm = false;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { siteSettings } = useSiteSettings();
  const handleInputChange = createInputHandler(setFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setFormSubmitted(false);
    
    try {
      const response = await contactApi.submit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
      
      if (response.message) {
        setFormSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        toast.success(response.message);
        
        // Reset success message after 5 seconds
        setTimeout(() => setFormSubmitted(false), 5000);
      } else if (response.error) {
        setFormError(response.error);
        toast.error(response.error);
      }
    } catch (err: any) {
      let errorMessage = 'Failed to send message. Please try again later.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.errors) {
          // Handle validation errors
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          errorMessage = errorMessages;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <Seo
        title={`${ABOUT.TITLE} | ${siteSettings.brand_name}`}
        description={ABOUT.CONTENT.WELCOME}
        path="/about"
        siteName={siteSettings.brand_name}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 hover:opacity-90 transition-opacity">
              <div className="h-14 w-auto flex items-center justify-center overflow-hidden">
                {siteSettings?.logo_url || (import.meta as { env?: { VITE_LOGO_URL?: string } }).env?.VITE_LOGO_URL ? (
                  <img 
                    src={siteSettings?.logo_url || (import.meta as { env?: { VITE_LOGO_URL?: string } }).env?.VITE_LOGO_URL || ''} 
                    alt={`${siteSettings?.brand_name || 'Logo'} Logo`} 
                    className="h-full w-auto object-contain max-h-14"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.logo-fallback')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'logo-fallback flex items-center gap-2';
                        const brandName = siteSettings?.brand_name || 'Brand';
                        const tagline = siteSettings?.tagline || '';
                        fallback.innerHTML = `
                          <div class="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
                            <span class="text-white text-lg font-bold">${brandName.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p class="text-xl text-white">${brandName}</p>
                            ${tagline ? `<p class="text-xs text-gray-400">${tagline}</p>` : ''}
                          </div>
                        `;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {(siteSettings?.brand_name || 'Brand').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xl text-white">{siteSettings?.brand_name || 'Brand'}</p>
                      {siteSettings?.tagline && (
                        <p className="text-xs text-gray-400">{siteSettings.tagline}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xl text-white">{siteSettings?.brand_name || 'Brand'}</p>
                {siteSettings?.tagline && (
                  <p className="text-xs text-gray-400">{siteSettings.tagline}</p>
                )}
              </div>
            </Link>

            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{NAV.BACK_TO_STORE}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Section */}
        <section className="mb-16">
          <h1 className="text-4xl font-bold text-white mb-6">{ABOUT.TITLE}</h1>
          <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-8 space-y-6">
            <div>
              <h2 className="text-2xl text-white mb-4">{ABOUT.SECTIONS.WHO_WE_ARE}</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                {ABOUT.CONTENT.WELCOME}
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                {ABOUT.CONTENT.MISSION}
              </p>
              <p className="text-gray-300 leading-relaxed">{ABOUT.CONTENT.TRUSTED_BY}</p>
            </div>

            <div>
              <h2 className="text-2xl text-white mb-4">{ABOUT.SECTIONS.AFFILIATE_DISCLOSURE}</h2>
              <p className="text-gray-300 leading-relaxed mb-4">{ABOUT.CONTENT.AFFILIATE_DISCLOSURE}</p>
              <p className="text-gray-300 leading-relaxed mb-4">{ABOUT.CONTENT.AFFILIATE_INTEGRITY}</p>
              <ul className="text-gray-400 text-sm sm:text-base space-y-1 list-disc list-inside">
                {ABOUT.CONTENT.AFFILIATE_PROMISE_ITEMS.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl text-white mb-4">{ABOUT.SECTIONS.OUR_COMMITMENT}</h2>
              <ul className="text-gray-400 text-sm sm:text-base space-y-1 list-disc list-inside mb-4">
                {ABOUT.CONTENT.WHAT_WE_DO_ITEMS.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-gray-300 leading-relaxed">{ABOUT.CONTENT.COMMITMENT}</p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">{ABOUT.SECTIONS.CONTACT_ME}</h2>
          <p className="text-gray-400 leading-relaxed mb-6 max-w-2xl">{ABOUT.CONTENT.CONTACT_INTRO}</p>
          <div className={`grid grid-cols-1 ${showContactForm ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-8`}>
            {/* Contact Information */}
            <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-8">
              <h3 className="text-xl text-white mb-6">{ABOUT.SECTIONS.GET_IN_TOUCH}</h3>
              {siteSettings?.contact_email || siteSettings?.contact_phone ? (
                <div className="space-y-4">
                  {siteSettings?.contact_email && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center shrink-0">
                        <Mail className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">{ABOUT.CONTACT.EMAIL}</p>
                        <a
                          href={`mailto:${siteSettings.contact_email}`}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          {siteSettings.contact_email}
                        </a>
                      </div>
                    </div>
                  )}
                  {siteSettings?.contact_phone && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center shrink-0">
                        <Phone className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">{ABOUT.CONTACT.PHONE}</p>
                        <a
                          href={`tel:${siteSettings.contact_phone.replace(/\s/g, '')}`}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          {siteSettings.contact_phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">{ABOUT.CONTENT.CONTACT_UNAVAILABLE}</p>
              )}

              <div className="mt-8 pt-8 border-t border-gray-800/50">
                <h4 className="text-white mb-4">{ABOUT.SECTIONS.BUSINESS_INQUIRIES}</h4>
                <p className="text-gray-300 text-sm mb-2">
                  {ABOUT.CONTENT.COLLABORATIONS}
                </p>
                <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                  {ABOUT.CONTENT.COLLABORATION_ITEMS.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contact Form (disabled) */}
            {showContactForm && (
              <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-8">
                <h3 className="text-xl text-white mb-6">{ABOUT.SECTIONS.SEND_MESSAGE}</h3>
                {formSubmitted ? (
                  <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4 text-green-400">
                    <p className="font-medium">{MESSAGES.SUCCESS.MESSAGE_SENT}</p>
                    <p className="text-sm mt-1">{MESSAGES.SUCCESS.GET_BACK_SOON}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && (
                      <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4 text-red-400">
                        <p className="text-sm whitespace-pre-line">{formError}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">{ABOUT.FORM.NAME}</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder={ABOUT.PLACEHOLDERS.NAME}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">{ABOUT.FORM.EMAIL}</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder={ABOUT.PLACEHOLDERS.EMAIL}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">{ABOUT.FORM.SUBJECT}</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        <option value="">{ABOUT.FORM.SELECT_SUBJECT}</option>
                        <option value="brand-promotion">{ABOUT.SUBJECT_OPTIONS.BRAND_PROMOTION}</option>
                        <option value="product-review">{ABOUT.SUBJECT_OPTIONS.PRODUCT_REVIEW}</option>
                        <option value="collaboration">{ABOUT.SUBJECT_OPTIONS.COLLABORATION}</option>
                        <option value="general">{ABOUT.SUBJECT_OPTIONS.GENERAL}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">{ABOUT.FORM.MESSAGE}</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                        placeholder={ABOUT.PLACEHOLDERS.MESSAGE}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {ABOUT.FORM.SENDING}
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          {ABOUT.FORM.SEND_MESSAGE}
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Ad Slot */}
        {hasAdsConfigured() && (
          <div className="my-12">
            <AdSlot type="horizontal" />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
