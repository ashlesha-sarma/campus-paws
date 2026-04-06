import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeftIcon, LogoMark, MoonIcon, SunIcon } from '../../components/Icons';

export default function Login() {
  const { setUser } = useAuth();
  const { dark, toggle } = useTheme();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await API.post('/auth/login', { email, password });
      setUser(r.data.user);
      nav(r.data.user.role === 'admin' ? '/admin' : '/');
    } catch (e) {
      setError(e.response?.data?.error || 'Sign in failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-pattern px-4 py-10 dark:bg-forest-950">
      <button onClick={toggle} className="fixed right-4 top-4 btn-icon">
        {dark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
      </button>

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden rounded-2xl border border-cream-200 bg-white p-8 shadow-card lg:block dark:border-forest-800 dark:bg-forest-900">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-terra-500 text-white">
                <LogoMark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-forest-950 dark:text-cream-100">CampusPaws</p>
                <p className="text-sm text-forest-500 dark:text-forest-400">Animal welfare and adoption portal</p>
              </div>
            </div>

            <h1 className="text-4xl leading-tight text-forest-950 dark:text-cream-100">
              Sign in to manage applications, donations, and community updates.
            </h1>
            <p className="mt-4 text-sm leading-7 text-forest-500 dark:text-forest-400">
              Access your profile to track adoption requests, review donation history, and continue supporting campus animal welfare.
            </p>

            <div className="mt-8 space-y-3">
              {[
                'Review your adoption applications in one place.',
                'Track donation activity and campaign participation.',
                'Stay connected with campus welfare updates.',
              ].map((item) => (
                <div key={item} className="rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-forest-600 dark:border-forest-800 dark:bg-forest-800/70 dark:text-forest-300">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="card mx-auto w-full max-w-lg p-7 sm:p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-terra-500 text-white lg:hidden">
                <LogoMark className="h-5 w-5" />
              </div>
              <p className="section-kicker">Account Access</p>
              <h2 className="mt-2 text-3xl text-forest-950 dark:text-cream-100">Sign in</h2>
              <p className="mt-3 text-sm leading-7 text-forest-500 dark:text-forest-400">
                Enter your registered email address and password to continue.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input pr-16"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-forest-500 hover:text-forest-700 dark:text-forest-400 dark:hover:text-forest-200"
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className={`btn-primary mt-2 w-full justify-center py-3 ${loading ? 'opacity-70' : ''}`}>
                {loading ? 'Signing in' : 'Sign In'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-forest-500 dark:text-forest-400">
              Need an account?{' '}
              <Link to="/register" className="font-medium text-terra-600 hover:text-terra-700 dark:text-terra-300">
                Create one here
              </Link>
            </p>

            <div className="mt-6 rounded-xl border border-cream-200 bg-cream-50 p-4 text-sm text-forest-600 dark:border-forest-800 dark:bg-forest-800/70 dark:text-forest-300">
              <p className="font-medium text-forest-800 dark:text-cream-100">Demo access</p>
              <p className="mt-2">User: demo@student.test / Demo@123</p>
              <p className="mt-1">Admin: admin@campuspaws.test / Admin@123</p>
            </div>

            <p className="mt-6 text-center">
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-forest-500 hover:text-terra-600 dark:text-forest-400 dark:hover:text-terra-300">
                <ArrowLeftIcon className="h-4 w-4" />
                Return to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
