'use client';

import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Lock, Mail, Sparkles, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, signup } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/profile');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login('builder@helio.events', 'secretpassword123');
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md luma-card p-6 sm:p-8 space-y-6 relative border border-white/[0.1] bg-[#161b22]/90 shadow-2xl">
        {/* Glow underlay */}
        <div className="absolute inset-0 bg-blue-500/5 filter blur-3xl pointer-events-none rounded-3xl" />

        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-semibold mb-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>helio ✦ events</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="text-xs sm:text-sm text-white/50 max-w-xs mx-auto">
            {mode === 'signin'
              ? 'Sign in with your email and password to access your tickets and host events.'
              : 'Join the Helio Events community to RSVP, register, and manage gatherings.'}
          </p>
        </div>

        {/* Switcher */}
        <div className="flex items-center p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl relative z-10">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${mode === 'signin'
              ? 'bg-white text-black shadow-sm'
              : 'text-white/60 hover:text-white'
              }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${mode === 'signup'
              ? 'bg-white text-black shadow-sm'
              : 'text-white/60 hover:text-white'
              }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs relative z-10 animate-in fade-in duration-200">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-white/70">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Satoshi Nakamoto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-white/70">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-white/70">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 luma-btn luma-btn-primary py-3.5 text-sm font-bold flex items-center justify-center gap-2 group shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Login */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] text-center space-y-2 relative z-10">
          <span className="text-[11px] text-white/40">Try with one click demo account:</span>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-xs font-semibold text-blue-400 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>⚡ Instant Demo Login (builder@helio.events)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
