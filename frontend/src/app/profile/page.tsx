'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { Registration, updateProfile } from '@/lib/api';
import { formatEventTime } from '@/lib/utils';
import {
  Calendar as CalIcon,
  Edit3,
  ExternalLink,
  Globe,
  Instagram,
  Linkedin,
  LogOut,
  Plus,
  QrCode,
  Sparkles,
  Ticket as TicketIcon,
  Twitter,
  Upload,
  Youtube
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const usernameParam = searchParams.get('username') || searchParams.get('user');

  useEffect(() => {
    if (usernameParam) {
      router.replace(`/profile/${usernameParam}`);
    }
  }, [usernameParam, router]);

  const { user, token, isLoading, logout, refreshUser, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'tickets' | 'hosting' | 'calendars'>('tickets');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditBio(user.bio || '');
      setEditAvatar(user.avatarUrl || '');
      setEditWebsite(user.website || '');
      setEditTwitter(user.twitterHandle || '');
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="py-32 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-white/50">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-28 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto text-2xl font-bold">
          <Sparkles className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Sign In to View Profile</h2>
          <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-sm mx-auto">
            Access your event tickets, manage guest lists, and customize your host profile.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={openAuthModal}
            className="w-full sm:w-auto luma-btn luma-btn-primary px-6 py-2.5 text-sm font-bold"
          >
            Sign In with Account
          </button>
          <Link
            href="/login"
            className="w-full sm:w-auto luma-btn luma-btn-secondary px-6 py-2.5 text-sm"
          >
            Go to Login Page
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      await updateProfile(token, {
        name: editName,
        bio: editBio,
        avatarUrl: editAvatar,
        website: editWebsite,
        twitterHandle: editTwitter,
      });
      await refreshUser();
      toast.success('Profile updated successfully!');
      setIsEditOpen(false);
    } catch (err: any) {
      const msg = err.message || 'Failed to update profile';
      setSaveError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const registrations = user.registrations || [];
  const hostingEvents = user.events || [];
  const calendars = user.calendars || [];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 pb-24 space-y-8">
      {/* ================= PROFILE HERO HEADER ================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-7">
        {/* Large Round Avatar */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-white/[0.06] ring-1 ring-white/10 flex-shrink-0 flex items-center justify-center">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl font-extrabold text-white">
              {user.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Info Right */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {user.name}
            </h1>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded-full px-3 py-1 transition-colors flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={logout}
                className="text-xs text-white/40 hover:text-red-400 border border-white/10 hover:border-red-500/20 rounded-full px-2.5 py-1 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="text-sm text-white/60 font-normal">
            @{user.username || 'user'}
          </div>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white/50 pt-0.5">
            <CalIcon className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
            <span>
              Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}
            </span>
          </div>

          {/* Stats: Hosted / Attended */}
          <div className="flex items-center gap-4 pt-1 text-xs sm:text-sm">
            <div>
              <span className="font-bold text-white text-sm sm:text-base mr-1">
                {hostingEvents.length}
              </span>
              <span className="text-white/50">Hosted</span>
            </div>
            <div>
              <span className="font-bold text-white text-sm sm:text-base mr-1">
                {registrations.length}
              </span>
              <span className="text-white/50">Attended</span>
            </div>
          </div>

          {/* Social Icons Row */}
          <div className="flex items-center gap-3.5 pt-2 text-white/50">
            {user.instagramHandle && (
              <a
                href={`https://instagram.com/${user.instagramHandle}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
                title={`@${user.instagramHandle} on Instagram`}
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {user.twitterHandle && (
              <a
                href={`https://x.com/${user.twitterHandle}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
                title={`@${user.twitterHandle} on X`}
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
              title="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
                title={user.website}
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-b border-white/[0.08] my-8 sm:my-10" />

      {/* ================= TABS SWITCHER ================= */}
      <div className="flex items-center border-b border-white/[0.08] gap-8">
        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'tickets'
            ? 'border-blue-500 text-white'
            : 'border-transparent text-white/50 hover:text-white'
            }`}
        >
          <TicketIcon className="w-4 h-4" />
          <span>My Tickets</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-white/70">
            {registrations.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hosting')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'hosting'
            ? 'border-blue-500 text-white'
            : 'border-transparent text-white/50 hover:text-white'
            }`}
        >
          <CalIcon className="w-4 h-4" />
          <span>Hosting Events</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-white/70">
            {hostingEvents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendars')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'calendars'
            ? 'border-blue-500 text-white'
            : 'border-transparent text-white/50 hover:text-white'
            }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Calendars</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-white/70">
            {calendars.length}
          </span>
        </button>
      </div>

      {/* ================= TAB 1: MY TICKETS ================= */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {registrations.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/[0.1] rounded-2xl p-8 space-y-4">
              <TicketIcon className="w-10 h-10 text-white/20 mx-auto" />
              <div>
                <h3 className="text-base font-semibold text-white">No Tickets Yet</h3>
                <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
                  You haven’t registered for any events yet. Explore upcoming gatherings in your city!
                </p>
              </div>
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 luma-btn luma-btn-primary px-4 py-2 text-xs font-semibold"
              >
                Discover Events
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="luma-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Portrait Cover Flyer */}
                    {reg.event?.coverUrl && (
                      <Link
                        href={`/${reg.event.slug}`}
                        className="w-20 sm:w-24 aspect-[3/4] rounded-xl overflow-hidden bg-white/[0.05] flex-shrink-0"
                      >
                        <img
                          src={reg.event.coverUrl}
                          alt={reg.event.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </Link>
                    )}

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                          {reg.event ? formatEventTime(reg.event.startAt, reg.event.endAt) : ''}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${reg.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : reg.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                              : 'bg-white/[0.05] text-white/60 border-white/[0.08]'
                            }`}
                        >
                          {reg.status}
                        </span>
                      </div>

                      <Link href={`/${reg.event?.slug}`} className="block">
                        <h3 className="text-base sm:text-lg font-bold text-white hover:text-blue-400 transition-colors line-clamp-1">
                          {reg.event?.name}
                        </h3>
                      </Link>

                      <div className="text-xs text-white/50 flex items-center gap-2 pt-1">
                        <span>Ticket: <strong className="text-white/80">{reg.ticket?.name || 'General Admission'}</strong></span>
                        <span>•</span>
                        <span>Key: <code className="text-white/70 font-mono text-[11px]">{reg.ticketKey}</code></span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Pass CTA */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(reg)}
                      className="luma-btn luma-btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <QrCode className="w-4 h-4 text-blue-400" />
                      <span>View Pass</span>
                    </button>
                    <Link
                      href={`/${reg.event?.slug}`}
                      className="p-2 rounded-full hover:bg-white/[0.08] text-white/50 hover:text-white transition-colors"
                      title="View Event Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: HOSTING EVENTS ================= */}
      {activeTab === 'hosting' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              Events You Are Hosting
            </h2>
            <Link
              href="/create"
              className="luma-btn luma-btn-primary px-3.5 py-1.5 text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Host New Event</span>
            </Link>
          </div>

          {hostingEvents.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/[0.1] rounded-2xl p-8 space-y-4">
              <CalIcon className="w-10 h-10 text-white/20 mx-auto" />
              <div>
                <h3 className="text-base font-semibold text-white">No Hosted Events Yet</h3>
                <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
                  Create your first event, set up registration approvals, and generate custom QR passes.
                </p>
              </div>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 luma-btn luma-btn-primary px-4 py-2 text-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
                Create Event Now
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {hostingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3.5 sm:gap-4 p-2 sm:p-2.5 -mx-2 sm:-mx-2.5 rounded-2xl hover:bg-white/[0.04] transition-all group justify-between"
                >
                  <Link href={`/${event.slug}`} className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                    {/* Square Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white/[0.05] ring-1 ring-white/[0.08] flex-shrink-0">
                      <img
                        src={event.coverUrl}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>

                    <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                      <div className="text-xs text-white/50 font-medium">
                        {formatEventTime(event.startAt, event.endAt)}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1 leading-snug">
                        {event.name}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-white/60">
                        <div className="w-4 h-4 rounded-full overflow-hidden bg-blue-500/20 ring-1 ring-white/10 flex-shrink-0">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px] text-white flex items-center justify-center h-full">
                              {user.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="truncate">By {user.name}</span>
                      </div>

                      <div className="text-xs text-white/40 truncate">
                        {event.calendar?.name || event.city || event.address || 'Online Event'}
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/manage/${event.slug}`}
                      className="luma-btn luma-btn-primary px-3 py-1.5 text-xs font-semibold"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: CALENDARS ================= */}
      {activeTab === 'calendars' && (
        <div className="space-y-4">
          {calendars.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/[0.1] rounded-2xl p-8 space-y-4">
              <Sparkles className="w-10 h-10 text-white/20 mx-auto" />
              <div>
                <h3 className="text-base font-semibold text-white">No Community Calendars</h3>
                <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
                  You are not currently running a community calendar. Explore calendars created by other builders.
                </p>
              </div>
              <Link
                href="/calendar/deepmind"
                className="inline-flex items-center gap-2 luma-btn luma-btn-primary px-4 py-2 text-xs font-semibold"
              >
                View Google DeepMind Calendar
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {calendars.map((cal) => (
                <div key={cal.id} className="luma-card p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 ring-1 ring-white/20">
                      {cal.avatarUrl && (
                        <img src={cal.avatarUrl} alt={cal.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{cal.name}</h4>
                      <p className="text-xs text-white/40">{cal.subscriberCount?.toLocaleString()} followers</p>
                    </div>
                  </div>
                  {cal.description && (
                    <p className="text-xs text-white/60 line-clamp-2">{cal.description}</p>
                  )}
                  <Link
                    href={`/calendar/${cal.slug}`}
                    className="inline-block text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    View Calendar →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= EDIT PROFILE DIALOG ================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md bg-[#161b22] border-white/[0.1] text-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Edit Host Profile</DialogTitle>
          </DialogHeader>

          {saveError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {saveError}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/70">Full Name</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/70">Bio</label>
              <textarea
                rows={3}
                placeholder="Tell guests about yourself or what you build..."
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-white/70">Photo Avatar</label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden ring-1 ring-white/20 bg-white/[0.05] flex-shrink-0">
                  {editAvatar ? (
                    <img src={editAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-white/40">
                      ?
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-xs font-semibold text-blue-400 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              toast.error('Image size exceeds 2 MB. Please select a photo under 2 MB.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) setEditAvatar(ev.target.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {/* <input
                    type="url"
                    placeholder="Or enter avatar image URL (https://...)"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                  /> */}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/70">Website URL</label>
              <input
                type="url"
                placeholder="https://yourwebsite.com"
                value={editWebsite}
                onChange={(e) => setEditWebsite(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/70">Twitter / X Username</label>
              <input
                type="text"
                placeholder="handle (without @)"
                value={editTwitter}
                onChange={(e) => setEditTwitter(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="luma-btn luma-btn-secondary px-4 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="luma-btn luma-btn-primary px-5 py-2 text-xs font-bold disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= TICKET QR PASS MODAL ================= */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="sm:max-w-sm bg-[#161b22] border-white/[0.1] text-white p-6 shadow-2xl text-center space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white text-center">
                Digital Event Pass
              </DialogTitle>
            </DialogHeader>

            <div>
              <h3 className="text-base font-extrabold text-white">
                {selectedTicket.event?.name}
              </h3>
              <p className="text-xs text-white/60 mt-0.5">
                {selectedTicket.ticket?.name || 'General Admission'}
              </p>
            </div>

            {selectedTicket.qrCode && (
              <div className="w-48 h-48 bg-white p-2.5 rounded-2xl mx-auto overflow-hidden shadow-xl ring-2 ring-blue-500/30">
                <img
                  src={selectedTicket.qrCode}
                  alt="Ticket QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-left space-y-1">
              <div className="text-[11px] text-white/40">Ticket Holder</div>
              <div className="text-xs font-semibold text-white">{selectedTicket.name}</div>
              <div className="text-[11px] text-white/50 font-mono pt-1">
                Pass ID: {selectedTicket.ticketKey}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTicket(null)}
              className="w-full luma-btn luma-btn-primary py-2.5 text-xs font-bold"
            >
              Close Pass
            </button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="py-32 text-center space-y-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-white/50">Loading profile...</p>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
