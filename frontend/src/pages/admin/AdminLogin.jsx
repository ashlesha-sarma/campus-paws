import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeftIcon, LogoMark, MoonIcon, SettingsIcon, SunIcon } from '../../components/Icons';

export default function AdminLogin() {
  const { setUser } = useAuth();
  const { dark, toggle } = useTheme();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await API.post('/auth/login', { email, password });
      if (r.data.user.role !== 'admin') {
        setError('This account does not have administrative access.');
        return;
      }
      setUser(r.data.user);
      nav('/admin');
    } catch (e) {
      setError(e.response?.data?.error || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-950 p-4">
      <button onClick={toggle} className="fixed right-4 top-4 btn-icon border-forest-700 bg-forest-900 text-cream-100">
        {dark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
      </button>

      <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-forest-800 bg-forest-900 p-8 shadow-card">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-terra-500 text-white">
              <LogoMark className="h-6 w-6" />
            </div>
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-terra-900/20 text-terra-300">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <h1 className="text-3xl text-cream-100">Admin sign in</h1>
            <p className="mt-2 text-sm text-forest-400">Access the CampusPaws administrative workspace.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest-300">Admin email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@campuspaws.test"
                className="input border-forest-700 bg-forest-800 text-cream-100 placeholder:text-forest-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input border-forest-700 bg-forest-800 text-cream-100 placeholder:text-forest-500"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-900 bg-red-900/20 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className={`btn-primary w-full justify-center py-3 ${loading ? 'opacity-70' : ''}`}>
              {loading ? 'Authenticating' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-forest-400 hover:text-terra-300">
              <ArrowLeftIcon className="h-4 w-4" />
              Return to public site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
