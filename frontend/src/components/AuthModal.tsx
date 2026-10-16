'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Lock, Mail, User as UserIcon } from 'lucide-react';
import React, { useState } from 'react';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, signup } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await login(email, password);
        toast.success('Signed in successfully!');
      } else {
        await signup(name, email, password);
        toast.success('Account created and signed in!');
      }
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      const msg = err.message || 'Authentication failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login('builder@helio.events', 'secretpassword123');
      toast.success('Signed in as demo builder!');
      closeAuthModal();
    } catch (err: any) {
      const msg = err.message || 'Demo login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-md bg-[#161b22] border-white/[0.1] text-white p-6 shadow-2xl">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-semibold mb-1">
            {/* <Sparkles className="w-3.5 h-3.5" /> */}
            <span>helio ✦ events</span>
          </div>

          <DialogTitle className="text-2xl font-extrabold tracking-tight text-white text-center">
            {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
          </DialogTitle>
          <p className="text-xs text-white/50 max-w-xs mx-auto">
            {mode === 'signin'
              ? 'Sign in to access your event tickets, host gatherings, and manage community calendars.'
              : 'Join Helio Events to RSVP, discover local tech gatherings, and build your audience.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl my-4">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${mode === 'signin'
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
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${mode === 'signup'
              ? 'bg-white text-black shadow-sm'
              : 'text-white/60 hover:text-white'
              }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-in fade-in duration-200">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full mt-2 luma-btn luma-btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2 group shadow-md disabled:opacity-50"
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

        {/* 1-Click Demo Login Helper */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] text-center space-y-2">
          <span className="text-[11px] text-white/40">Want to test quickly?</span>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-xs font-semibold text-blue-400 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>⚡ Sign in with Demo Account (builder@helio.events)</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
