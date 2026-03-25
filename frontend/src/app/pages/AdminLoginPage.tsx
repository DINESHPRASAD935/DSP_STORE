import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Lock, User } from 'lucide-react';

import { Seo } from '../components/Seo';
import { adminApi } from '../services/api';

export function AdminLoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [csrfLoading, setCsrfLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        setCsrfLoading(true);
        await adminApi.getCsrf();
      } catch {
        // Even if CSRF init fails, login might still work depending on backend config.
        // We'll let the login request decide.
      } finally {
        setCsrfLoading(false);
      }
    };

    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.login({ username, password });
      toast.success('Logged in successfully.');
      navigate('/adminui', { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
      <Seo title="Admin Login | MrDSP Hub" description="Admin login" path="/adminui/login" noindex />

      <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-6 shadow-2xl">
        <h1 className="text-2xl text-white font-semibold mb-2">Admin Login</h1>
        <p className="text-gray-400 text-sm mb-6">Sign in to manage products, blog content, and settings.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="admin"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </label>
            <input
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || csrfLoading}
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-lg rounded-xl hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

