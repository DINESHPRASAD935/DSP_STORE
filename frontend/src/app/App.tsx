import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { BlogListPage } from './pages/BlogListPage';
import { AdminPage } from './pages/AdminPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AboutPage } from './pages/AboutPage';
import { LegalPage } from './pages/LegalPage';
import { ScrollToTop } from './components/ScrollToTop';

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/legal/:slug" element={<LegalPage />} />
        <Route path="/adminui" element={<AdminPage />} />
        <Route path="/adminui/login" element={<AdminLoginPage />} />

        {/* Backwards compatibility */}
        <Route path="/adminmrdsp" element={<Navigate to="/adminui" replace />} />
      </Routes>
        <Toaster position="top-right" richColors />
    </BrowserRouter>
    </ErrorBoundary>
  );
}
