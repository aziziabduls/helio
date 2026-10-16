'use client';

import TimelineSection from '@/components/TimelineSection';
import { useAuth } from '@/context/AuthContext';
import { Calendar, EventItem, fetchCalendarBySlug, updateCalendar } from '@/lib/api';
import {
  Calendar as CalIcon,
  Camera,
  Check,
  Loader2,
  Palette,
  Pencil,
  Plus,
  ShieldCheck,
  Upload,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const TINT_COLORS = [
  { name: 'Luma Blue', value: '#2e72e0' },
  { name: 'Neon Violet', value: '#8b5cf6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber Glow', value: '#f59e0b' },
  { name: 'Crimson', value: '#ef4444' },
  { name: 'Pink Rose', value: '#ec4899' },
  { name: 'Cyan Tech', value: '#06b6d4' },
];

export default function CalendarPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user } = useAuth();

  const [calendar, setCalendar] = useState<
    (Calendar & { events: EventItem[]; owner: any }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [timeframe, setTimeframe] = useState<'upcoming' | 'past'>('upcoming');

  // Edit Calendar Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editTintColor, setEditTintColor] = useState('#2e72e0');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchCalendarBySlug(slug)
      .then((data) => {
        setCalendar(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load calendar:', err);
        setLoading(false);
      });
  }, [slug]);

  // Check if current logged-in user is the calendar owner
  const isOwner =
    !!user &&
    (user.id === calendar?.owner?.id ||
      user.id === (calendar as any)?.ownerId ||
      user.email === calendar?.owner?.email);

  const handleOpenEditModal = () => {
    if (!calendar) return;
    setEditName(calendar.name || '');
    setEditSlug(calendar.slug || '');
    setEditDescription(calendar.description || '');
    setEditAvatarUrl(calendar.avatarUrl || '');
    setEditCoverUrl(calendar.coverUrl || '');
    setEditTintColor(calendar.tintColor || '#2e72e0');
    setIsEditModalOpen(true);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image is too large. Max file size is 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditAvatarUrl(reader.result as string);
      toast.success('Avatar image uploaded');
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Banner is too large. Max file size is 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditCoverUrl(reader.result as string);
      toast.success('Cover banner uploaded');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calendar) return;

    if (!editName.trim()) {
      toast.error('Calendar name cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      const updated = await updateCalendar(calendar.slug, {
        name: editName.trim(),
        slug: editSlug.trim() || undefined,
        description: editDescription.trim() || undefined,
        avatarUrl: editAvatarUrl.trim() || undefined,
        coverUrl: editCoverUrl.trim() || undefined,
        tintColor: editTintColor,
      });

      // Update state in place
      setCalendar((prev) =>
        prev
          ? {
              ...prev,
              ...updated,
              owner: prev.owner,
              events: prev.events,
            }
          : null
      );

      setIsEditModalOpen(false);
      toast.success('Calendar updated successfully!');

      // If slug changed, navigate to new URL
      if (updated.slug && updated.slug !== calendar.slug) {
        router.replace(`/calendar/${updated.slug}`);
      }
    } catch (err: any) {
      console.error('Failed to update calendar:', err);
      toast.error(err.message || 'Failed to update calendar');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-white/50">Loading calendar...</p>
      </div>
    );
  }

  if (!calendar) {
    return (
      <div className="max-w-md mx-auto py-32 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Calendar Not Found</h2>
        <Link href="/" className="inline-block luma-btn luma-btn-primary px-4 py-2 text-sm">
          Return Home
        </Link>
      </div>
    );
  }

  const upcomingEvents = calendar.events.filter(
    (e) => new Date(e.endAt) >= new Date()
  );
  const pastEvents = calendar.events.filter(
    (e) => new Date(e.endAt) < new Date()
  );

  const currentEvents = timeframe === 'upcoming' ? upcomingEvents : pastEvents;

  // Group events by date string (e.g. "2026-10-24")
  const groupedEvents = currentEvents.reduce((acc, event) => {
    const dateKey = event.startAt.split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, EventItem[]>);

  const dateKeys = Object.keys(groupedEvents);

  return (
    <div className="min-h-screen pb-20">
      {/* Cover Banner */}
      <div className="relative w-full h-48 sm:h-64 bg-white/[0.05] overflow-hidden group/cover">
        {calendar.coverUrl && (
          <img
            src={calendar.coverUrl}
            alt={calendar.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/50 to-transparent" />

        {/* Quick Edit Cover for Owner */}
        {isOwner && (
          <button
            type="button"
            onClick={handleOpenEditModal}
            className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-xs font-medium text-white/90 hover:text-white flex items-center gap-1.5 transition-all shadow-lg"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit Banner</span>
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-16 sm:-mt-20 z-10 space-y-8">
        {/* Header Profile */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6">
          <div className="flex items-end gap-4">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-[#0b0e14] shadow-2xl bg-white/[0.05] flex-shrink-0 group/ava">
              {calendar.avatarUrl ? (
                <img
                  src={calendar.avatarUrl}
                  alt={calendar.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/10 text-white font-bold text-2xl">
                  {calendar.name.charAt(0)}
                </div>
              )}

              {/* Quick Edit Avatar for Owner */}
              {isOwner && (
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover/ava:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1"
                  title="Change Avatar"
                >
                  <Camera className="w-5 h-5 text-white/90" />
                  <span className="text-[10px] font-medium text-white/80">Change</span>
                </button>
              )}
            </div>

            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {calendar.name}
                </h1>
                <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
              </div>
              <div className="text-xs text-white/50 flex items-center gap-2 mt-1">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {calendar.subscriberCount?.toLocaleString() || '14,200'} subscribers
                </span>
                <span>•</span>
                <span>Managed by {calendar.owner?.name}</span>
              </div>
            </div>
          </div>

          {/* Action Area: Edit Calendar (for Owner) + Subscribe CTA */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {isOwner && (
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="luma-btn px-4 py-2.5 text-sm font-semibold flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white transition-all rounded-xl shadow-sm"
              >
                <Pencil className="w-4 h-4 text-white/70" />
                <span>Edit Calendar</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setFollowing(!following)}
              className={`luma-btn px-6 py-2.5 text-sm font-semibold flex items-center gap-2 ${
                following
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                  : 'luma-btn-primary'
              }`}
            >
              {following ? (
                <>
                  <Check className="w-4 h-4" />
                  Subscribed
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Subscribe to Calendar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Description */}
        {calendar.description && (
          <p className="text-sm text-white/70 max-w-2xl leading-relaxed whitespace-pre-line">
            {calendar.description}
          </p>
        )}

        {/* Events Section */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CalIcon className="w-4 h-4 text-blue-400" />
              {timeframe === 'upcoming' ? 'Upcoming Events' : 'Past Events'} ({currentEvents.length})
            </h2>

            {/* Segmented Switcher (Upcoming / Past) */}
            <div className="flex items-center p-1 bg-white/[0.05] border border-white/[0.08] rounded-full self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setTimeframe('upcoming')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  timeframe === 'upcoming'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Upcoming ({upcomingEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('past')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  timeframe === 'past'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Past ({pastEvents.length})
              </button>
            </div>
          </div>

          {/* Events Timeline Container */}
          {dateKeys.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-white/[0.1] rounded-2xl p-8 space-y-4">
              <CalIcon className="w-10 h-10 text-white/20 mx-auto" />
              <div>
                <h3 className="text-base font-semibold text-white">No {timeframe} events found</h3>
                <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
                  There are no {timeframe} events scheduled for this calendar.
                </p>
                {timeframe === 'upcoming' && pastEvents.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTimeframe('past')}
                    className="inline-block mt-3 text-xs text-blue-400 hover:text-blue-300 font-medium underline"
                  >
                    View {pastEvents.length} past {pastEvents.length === 1 ? 'event' : 'events'} →
                  </button>
                )}
              </div>
              {isOwner && (
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 luma-btn luma-btn-primary px-4 py-2 text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Host an Event
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {dateKeys.map((dateKey, index) => (
                <TimelineSection
                  key={dateKey}
                  dateStr={dateKey}
                  events={groupedEvents[dateKey]}
                  isLast={index === dateKeys.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL: EDIT CALENDAR ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-[#131924] border border-white/15 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-blue-400" />
                  Edit Calendar Settings
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Update your community calendar profile, branding, and details
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={avatarInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
            <input
              type="file"
              ref={coverInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleCoverFileChange}
            />

            <form onSubmit={handleSaveCalendar} className="space-y-4">
              {/* Cover Banner Uploader */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70">Cover Banner</label>
                <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] group/banner">
                  {editCoverUrl ? (
                    <>
                      <img
                        src={editCoverUrl}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-medium text-white flex items-center gap-1.5 transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Change Banner</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditCoverUrl('')}
                          className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-xs font-medium text-red-300 transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                      <span className="text-xs font-medium">Upload Cover Banner</span>
                      <span className="text-[10px] text-white/30">PNG, JPG or WebP (Max 2MB)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Avatar Uploader */}
              <div className="flex items-center gap-3 pt-1">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20 bg-white/[0.05] flex-shrink-0 group/ava shadow-md">
                  {editAvatarUrl ? (
                    <>
                      <img
                        src={editAvatarUrl}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover/ava:opacity-100 transition-opacity flex items-center justify-center text-white"
                        title="Change Avatar"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
                      title="Upload Avatar"
                    >
                      <Camera className="w-4 h-4 text-white/40" />
                      <span className="text-[9px] mt-0.5 font-medium">Logo</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-medium text-white transition-all flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{editAvatarUrl ? 'Change Avatar' : 'Upload Avatar'}</span>
                    </button>
                    {editAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => setEditAvatarUrl('')}
                        className="text-xs text-white/40 hover:text-red-400 px-2 py-1 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-white/40 block mt-1">
                    Square logo or icon for your community calendar
                  </span>
                </div>
              </div>

              {/* Calendar Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">Calendar Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jakarta AI Society, UI/UX Community"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              {/* Calendar URL Slug */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">Calendar URL Handle</label>
                <div className="flex items-center rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-xs text-white focus-within:border-white/30">
                  <span className="text-white/40 select-none">/calendar/</span>
                  <input
                    type="text"
                    required
                    placeholder="my-calendar-slug"
                    value={editSlug}
                    onChange={(e) =>
                      setEditSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-_]/g, '')
                      )
                    }
                    className="flex-1 bg-transparent text-white focus:outline-none ml-1"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">Description</label>
                <textarea
                  rows={3}
                  placeholder="Tell people what kind of events and community gatherings you host..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/30 resize-none leading-relaxed"
                />
              </div>

              {/* Tint / Theme Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-white/60" />
                  <span>Theme Accent Color</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {TINT_COLORS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setEditTintColor(t.value)}
                      className={`size-7 rounded-full border-2 transition-transform flex items-center justify-center ${
                        editTintColor === t.value
                          ? 'border-white scale-110 shadow-lg'
                          : 'border-transparent hover:scale-105 opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: t.value }}
                      title={t.name}
                    >
                      {editTintColor === t.value && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={editTintColor}
                    onChange={(e) => setEditTintColor(e.target.value)}
                    className="size-7 rounded-full bg-transparent cursor-pointer border-0 p-0 ml-1"
                    title="Custom Color"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-white/70 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="luma-btn luma-btn-primary px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
