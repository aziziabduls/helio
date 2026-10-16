'use client';

import MultipleSelector from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  createCalendar,
  createEvent,
  fetchCalendars,
  fetchCategories,
  fetchEventBySlug,
  updateEvent
} from '@/lib/api';
import {
  ArrowLeft,
  Calendar as CalIcon,
  Camera,
  ChevronDown,
  Clock,
  Image as ImageIcon,
  MapPin,
  Plus,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';

const PRESET_COVERS = [
  // {
  //   name: 'Hardware Hackathon (Gemma Blue)',
  //   portraitUrl: 'https://images.lumacdn.com/uploads/ul/347bf4cf-3703-4559-9b27-c3ffc37e1dd7.png',
  // },
  {
    name: 'AI Neural Matrix',
    portraitUrl: 'https://images.lumacdn.com/uploads/0z/c1143c0e-a2ab-4434-b82b-80b0ba3ec2f0.png',
  },
  // {
  //   name: 'Jakarta Runners Club',
  //   portraitUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&auto=format&fit=crop&q=80',
  // },
  {
    name: 'Creative Design & Tech',
    portraitUrl: 'https://images.lumacdn.com/uploads/u8/5eeba5a4-d305-4bc1-9017-329937813f30.png',
  },
  {
    name: 'Coffee & Breakfast Meetup',
    portraitUrl: 'https://images.lumacdn.com/uploads/36/a77db635-cb3b-4720-9758-2bc9dae948e4.png',
  }
  // {
  //   name: 'Mindful Fitness & Movement',
  //   portraitUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
  // },
];

const PRESET_TINTS = [
  { name: 'Forest Green', hex: '#152614' },
  { name: 'Midnight Navy', hex: '#0e1626' },
  { name: 'Royal Indigo', hex: '#1e1b4b' },
  { name: 'Sunset Purple', hex: '#2e1065' },
  { name: 'Crimson Noir', hex: '#3b111a' },
  { name: 'Warm Amber', hex: '#451a03' },
  { name: 'Emerald Green', hex: '#064e3b' },
  { name: 'Slate Dark', hex: '#18181b' },
];

const FONT_OPTIONS = [
  { id: 'sans', name: 'Sans', label: 'Modern Sans', className: 'font-style-sans' },
  { id: 'serif', name: 'Serif', label: 'Editorial Serif', className: 'font-style-serif' },
  { id: 'mono', name: 'Mono', label: 'Hacker Mono', className: 'font-style-mono' },
  { id: 'grotesk', name: 'Grotesk', label: 'Bold Tech', className: 'font-style-grotesk' },
];

const DEFAULT_CATEGORIES = [
  '#Tech',
  '#AI',
  '#Arts & Culture',
  '#Design',
  '#Food & Drink',
  '#Fitness',
  '#Running',
  '#Crypto',
  '#Books',
  '#Games',
  '#Climate',
];

interface TicketTier {
  id: string;
  name: string;
  type: 'free' | 'paid' | 'vip' | 'donation' | 'approval' | 'early_bird';
  price: number;
  currency: string;
  capacity: string;
  description: string;
  requireApproval: boolean;
  saleStartAt?: string;
  saleEndAt?: string;
}

interface MerchandiseFormItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  stock: string;
}

const TIMEZONE_GROUPS = [
  {
    name: 'Asia & Pacific',
    items: [
      { label: 'Asia/Jakarta (GMT+7)', value: 'Asia/Jakarta' },
      { label: 'Asia/Singapore (GMT+8)', value: 'Asia/Singapore' },
      { label: 'Asia/Tokyo (JST)', value: 'Asia/Tokyo' },
      { label: 'Asia/Bangkok (GMT+7)', value: 'Asia/Bangkok' },
      { label: 'Asia/Dubai (GST)', value: 'Asia/Dubai' },
      { label: 'Australia/Sydney (AEST)', value: 'Australia/Sydney' },
    ],
  },
  {
    name: 'Americas',
    items: [
      { label: 'America/Los_Angeles (PST)', value: 'America/Los_Angeles' },
      { label: 'America/New_York (EST)', value: 'America/New_York' },
      { label: 'America/Chicago (CST)', value: 'America/Chicago' },
      { label: 'America/Denver (MST)', value: 'America/Denver' },
      { label: 'America/Sao_Paulo (BRT)', value: 'America/Sao_Paulo' },
    ],
  },
  {
    name: 'Europe & Africa',
    items: [
      { label: 'Europe/London (GMT)', value: 'Europe/London' },
      { label: 'Europe/Paris (CET)', value: 'Europe/Paris' },
      { label: 'Europe/Berlin (CET)', value: 'Europe/Berlin' },
      { label: 'Africa/Cairo (EET)', value: 'Africa/Cairo' },
    ],
  },
  {
    name: 'Universal',
    items: [
      { label: 'UTC', value: 'UTC' },
    ],
  },
];

const TICKET_TYPES = [
  { label: 'Free RSVP', value: 'free' },
  { label: 'Paid Ticket', value: 'paid' },
  { label: 'VIP', value: 'vip' },
  { label: 'Approval Only', value: 'approval' },
  { label: 'Early Bird', value: 'early_bird' },
  { label: 'Donation', value: 'donation' },
];

function getPalette(hex?: string | null) {
  if (!hex || !hex.startsWith('#')) {
    return {
      pageBg: '#0e1626',
      cardBg: '#162238',
      squircleBg: '#142034',
      cardBorder: 'rgba(56, 110, 200, 0.25)',
      footerBorder: '#1c2d4a',
    };
  }
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  const deg = Math.round(h * 360);
  const sat = Math.round(s * 45);
  return {
    pageBg: `hsl(${deg}, ${sat}%, 11%)`,
    cardBg: `hsl(${deg}, ${sat}%, 15%)`,
    squircleBg: `hsl(${deg}, ${sat}%, 13%)`,
    cardBorder: `hsla(${deg}, ${sat}%, 30%, 0.3)`,
    footerBorder: `hsla(${deg}, ${sat}%, 22%, 0.4)`,
  };
}

function CreateEventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams?.get('edit');
  const isEditMode = Boolean(editSlug);

  const { user, openAuthModal } = useAuth();

  // Basic Details
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState<string[]>(DEFAULT_CATEGORIES);

  // Calendars
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [createdCalendarIds, setCreatedCalendarIds] = useState<string[]>([]);
  const [calendarSlug, setCalendarSlug] = useState<string>('');
  const [isNewCalendarModalOpen, setIsNewCalendarModalOpen] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [newCalendarDescription, setNewCalendarDescription] = useState('');
  const [newCalendarAvatar, setNewCalendarAvatar] = useState<string>('');
  const [newCalendarCover, setNewCalendarCover] = useState<string>('');
  const [isCreatingCalendar, setIsCreatingCalendar] = useState(false);

  // Only calendars created / owned by the current logged-in user
  const myCalendars = useMemo(() => {
    if (!user) {
      return calendars.filter((c) => createdCalendarIds.includes(c.id));
    }
    return calendars.filter(
      (c) =>
        c.ownerId === user.id ||
        c.owner?.id === user.id ||
        (c.owner as any)?.email === user.email ||
        createdCalendarIds.includes(c.id)
    );
  }, [calendars, user, createdCalendarIds]);

  // Theme & Font
  const [tintColor, setTintColor] = useState('#152614');
  const [font, setFont] = useState('sans');
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  // Host Avatar State
  const [hostAvatar, setHostAvatar] = useState(
    user?.avatarUrl || 'https://images.lumacdn.com/avatars/7l/7860ba89-4a48-4147-9d29-2fd0ac9a724f.png'
  );

  // Cover Image
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0].portraitUrl);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [customCoverInput, setCustomCoverInput] = useState('');

  // Date, Time & Timezone (Defaults to tomorrow 10:00 to 12:00)
  const getInitialDates = () => {
    const start = new Date(Date.now() + 86400000);
    start.setHours(10, 0, 0, 0);
    const end = new Date(start.getTime() + 7200000);
    const toIsoLocal = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };
    return { startStr: toIsoLocal(start), endStr: toIsoLocal(end) };
  };

  const initialDates = getInitialDates();
  const [startAt, setStartAt] = useState(initialDates.startStr);
  const [endAt, setEndAt] = useState(initialDates.endStr);
  const [timezone, setTimezone] = useState('Asia/Jakarta');

  // Location
  const [locationType, setLocationType] = useState<'offline' | 'online'>('offline');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Jakarta');
  const [virtualUrl, setVirtualUrl] = useState('');

  // Registration & Multiple Ticket Tiers
  const [requireApprovalGlobal, setRequireApprovalGlobal] = useState(false);
  const [maxCapacity, setMaxCapacity] = useState<string>('100');
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
    {
      id: 'tier-1',
      name: 'General Admission',
      type: 'free',
      price: 0,
      currency: 'IDR',
      capacity: '100',
      description: 'Standard event RSVP pass with general access.',
      requireApproval: false,
      saleStartAt: initialDates.startStr,
      saleEndAt: initialDates.endStr,
    },
  ]);

  // Merchandise & Add-ons
  const [merchandises, setMerchandises] = useState<MerchandiseFormItem[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const calendarAvatarInputRef = useRef<HTMLInputElement>(null);
  const calendarCoverInputRef = useRef<HTMLInputElement>(null);

  // Sync user profile avatar if not in edit mode
  useEffect(() => {
    if (!isEditMode && user?.avatarUrl) {
      setHostAvatar(user.avatarUrl);
    }
  }, [user, isEditMode]);

  // Load existing event data if editing
  useEffect(() => {
    if (!editSlug) return;

    setIsLoadingEdit(true);
    fetchEventBySlug(editSlug)
      .then((evt) => {
        // Check if event is ongoing
        const now = new Date();
        const start = new Date(evt.startAt);
        const end = new Date(evt.endAt);
        const isOngoing = now >= start && now <= end;

        if (isOngoing) {
          toast.error('This event is currently ongoing and cannot be edited.');
          router.push(`/${evt.slug}`);
          return;
        }

        setName(evt.name);
        setDescription(evt.description || '');
        if (evt.category) {
          const list = Array.isArray(evt.category)
            ? evt.category
            : typeof evt.category === 'string'
              ? evt.category.split(',').map((c) => c.trim()).filter(Boolean)
              : [];
          setCategories(list.map((c) => (c.startsWith('#') ? c : `#${c}`)));
        } else {
          setCategories([]);
        }
        if (evt.coverUrl) setCoverUrl(evt.coverUrl);
        if (evt.tintColor) setTintColor(evt.tintColor);
        if (evt.font) setFont(evt.font);
        if (evt.host?.avatarUrl) setHostAvatar(evt.host.avatarUrl);
        if (evt.locationType) setLocationType(evt.locationType as any);
        if (evt.address) setAddress(evt.address);
        if (evt.city) setCity(evt.city);
        if (evt.virtualUrl) setVirtualUrl(evt.virtualUrl);
        if (evt.calendar?.slug) setCalendarSlug(evt.calendar.slug);
        if (evt.timezone) setTimezone(evt.timezone);
        setRequireApprovalGlobal(Boolean(evt.requireApproval));
        if (evt.maxCapacity) setMaxCapacity(String(evt.maxCapacity));

        const toIsoLocal = (d: Date) => {
          const offset = d.getTimezoneOffset() * 60000;
          return new Date(d.getTime() - offset).toISOString().slice(0, 16);
        };
        if (evt.startAt) setStartAt(toIsoLocal(new Date(evt.startAt)));
        if (evt.endAt) setEndAt(toIsoLocal(new Date(evt.endAt)));

        if (evt.tickets && evt.tickets.length > 0) {
          setTicketTiers(
            evt.tickets.map((t) => ({
              id: t.id,
              name: t.name,
              type: (t.type as any) || 'free',
              price: t.price || 0,
              currency: t.currency || 'IDR',
              capacity: t.capacity ? String(t.capacity) : '',
              description: t.description || '',
              requireApproval: Boolean(t.requireApproval),
              saleStartAt: t.saleStartAt ? toIsoLocal(new Date(t.saleStartAt)) : toIsoLocal(new Date(evt.startAt)),
              saleEndAt: t.saleEndAt ? toIsoLocal(new Date(t.saleEndAt)) : toIsoLocal(new Date(evt.endAt)),
            }))
          );
        }

        if (evt.merchandises && evt.merchandises.length > 0) {
          setMerchandises(
            evt.merchandises.map((m) => ({
              id: m.id || `merch-${Math.random()}`,
              name: m.name,
              description: m.description || '',
              price: m.price || 0,
              currency: m.currency || 'IDR',
              imageUrl: m.imageUrl || '',
              stock: m.stock ? String(m.stock) : '',
            }))
          );
        }
        toast.info(`Editing event: ${evt.name}`);
      })
      .catch((err) => {
        console.error('Failed to load event for editing:', err);
        toast.error('Failed to load event details for editing');
      })
      .finally(() => {
        setIsLoadingEdit(false);
      });
  }, [editSlug, router]);

  // Load calendars from API (default to empty/no calendar unless user chooses or creates one)
  useEffect(() => {
    fetchCalendars()
      .then((cals) => {
        setCalendars(cals);
      })
      .catch((err) => console.error('Failed to fetch calendars:', err));

    fetchCategories()
      .then((cats) => {
        if (cats && cats.length > 0) {
          const names = cats.map((c) => c.name);
          setCategoriesList((prev) => Array.from(new Set([...prev, ...names])));
        }
      })
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, []);

  // Compute dynamic palette
  const palette = getPalette(tintColor);
  const { pageBg, cardBg, squircleBg, cardBorder } = palette;

  // Sync navbar and body background seamlessly with create page's custom pageBg (like in EventDetailView)
  useEffect(() => {
    document.documentElement.style.setProperty('--event-page-bg', pageBg);
    const prevBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = pageBg;

    return () => {
      document.documentElement.style.removeProperty('--event-page-bg');
      document.body.style.backgroundColor = prevBodyBg;
    };
  }, [pageBg]);

  const fontClass =
    font === 'serif'
      ? 'font-style-serif'
      : font === 'mono'
        ? 'font-style-mono'
        : font === 'grotesk'
          ? 'font-style-grotesk'
          : 'font-style-sans';

  // Format Date for preview
  const formatDates = () => {
    try {
      const d = new Date(startAt);
      if (isNaN(d.getTime())) return { month: 'OCT', day: '18', fullDate: 'Select Date', timeRange: 'Select Time' };
      const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      const day = d.getDate();
      const fullDate = d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
      const startTime = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      let endTime = '';
      if (endAt) {
        const e = new Date(endAt);
        if (!isNaN(e.getTime())) {
          endTime = e.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
      }
      return { month, day, fullDate, timeRange: endTime ? `${startTime} - ${endTime}` : startTime };
    } catch {
      return { month: 'OCT', day: '18', fullDate: 'Select Date', timeRange: 'Select Time' };
    }
  };

  const dateInfo = formatDates();

  // Cover image file upload
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCoverUrl(reader.result);
          setIsCoverModalOpen(false);
          toast.success('Cover image updated');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Avatar image file upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setHostAvatar(reader.result);
          toast.success('Host avatar updated');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Calendar Avatar image file upload
  const handleCalendarAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setNewCalendarAvatar(reader.result);
          toast.success('Calendar avatar selected');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Calendar Banner / Cover image file upload
  const handleCalendarCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setNewCalendarCover(reader.result);
          toast.success('Calendar banner selected');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add custom category
  const handleAddCustomCategory = () => {
    const trimmed = customCategoryInput.trim();
    if (!trimmed) return;
    const formatted = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    if (!categoriesList.includes(formatted)) {
      setCategoriesList((prev) => [formatted, ...prev]);
    }
    if (!categories.includes(formatted)) {
      setCategories((prev) => [...prev, formatted]);
    }
    setCustomCategoryInput('');
    setIsCategoryModalOpen(false);
    toast.success(`Category "${formatted}" added`);
  };

  // Create new calendar in-place
  const handleCreateNewCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalendarName.trim()) {
      toast.error('Calendar name is required');
      return;
    }

    setIsCreatingCalendar(true);
    try {
      const newCal = await createCalendar({
        name: newCalendarName.trim(),
        description: newCalendarDescription.trim() || undefined,
        avatarUrl: newCalendarAvatar.trim() || undefined,
        coverUrl: newCalendarCover.trim() || undefined,
        tintColor,
      });

      setCalendars((prev) => [newCal, ...prev]);
      setCreatedCalendarIds((prev) => [...prev, newCal.id]);
      setCalendarSlug(newCal.slug);
      setIsNewCalendarModalOpen(false);
      setNewCalendarName('');
      setNewCalendarDescription('');
      setNewCalendarAvatar('');
      setNewCalendarCover('');
      toast.success(`Calendar "${newCal.name}" created and linked!`);
    } catch (err: any) {
      console.error('Failed to create calendar:', err);
      toast.error(err.message || 'Failed to create calendar');
    } finally {
      setIsCreatingCalendar(false);
    }
  };

  // Add ticket tier
  const handleAddTicketTier = () => {
    const newTier: TicketTier = {
      id: `tier-${Date.now()}`,
      name: 'VIP Pass',
      type: 'paid',
      price: 150000,
      currency: 'IDR',
      capacity: '50',
      description: 'Exclusive priority admission and community access.',
      requireApproval: false,
    };
    setTicketTiers((prev) => [...prev, newTier]);
    toast.success('New ticket tier added');
  };

  const handleRemoveTicketTier = (id: string) => {
    if (ticketTiers.length <= 1) {
      toast.error('Event must have at least one ticket tier');
      return;
    }
    setTicketTiers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateTicketTier = (id: string, updates: Partial<TicketTier>) => {
    setTicketTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  // Merchandise handlers
  const handleAddMerchandise = () => {
    const newMerch: MerchandiseFormItem = {
      id: `merch-${Date.now()}`,
      name: '',
      description: '',
      price: 150000,
      currency: 'IDR',
      imageUrl: '',
      stock: '50',
    };
    setMerchandises((prev) => [...prev, newMerch]);
    toast.success('New merchandise item added');
  };

  const handleRemoveMerchandise = (id: string) => {
    setMerchandises((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdateMerchandise = (id: string, updates: Partial<MerchandiseFormItem>) => {
    setMerchandises((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleMerchandiseImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleUpdateMerchandise(id, { imageUrl: reader.result });
          toast.success('Merchandise image uploaded');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit event (Create or Update)
  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) {
      setError('Please provide an event name.');
      toast.error('Please provide an event name.');
      return;
    }
    if (!startAt || !endAt) {
      setError('Please provide start and end times.');
      toast.error('Please provide start and end times.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedTickets = ticketTiers.map((t) => ({
        name: t.name,
        type: t.type,
        price: t.type === 'free' || t.type === 'approval' ? 0 : Number(t.price) || 0,
        currency: t.currency,
        capacity: t.capacity ? Number(t.capacity) : undefined,
        description: t.description || undefined,
        requireApproval: t.requireApproval || requireApprovalGlobal,
        saleStartAt: t.saleStartAt ? new Date(t.saleStartAt).toISOString() : new Date(startAt).toISOString(),
        saleEndAt: t.saleEndAt ? new Date(t.saleEndAt).toISOString() : new Date(endAt).toISOString(),
      }));

      const formattedMerchandise = merchandises
        .filter((m) => m.name.trim())
        .map((m) => ({
          name: m.name.trim(),
          description: m.description.trim() || undefined,
          price: Number(m.price) || 0,
          currency: m.currency || 'IDR',
          imageUrl: m.imageUrl.trim() || undefined,
          stock: m.stock ? Number(m.stock) : undefined,
        }));

      if (isEditMode && editSlug) {
        // UPDATE EXISTING EVENT
        const updatedEvent = await updateEvent(editSlug, {
          name: name.trim(),
          description: description.trim() || 'Join us for this gathering!',
          coverUrl,
          hostAvatarUrl: hostAvatar || user?.avatarUrl,
          category: categories,
          tintColor,
          font,
          locationType,
          address: locationType === 'offline' ? address : undefined,
          city: locationType === 'offline' ? city : undefined,
          virtualUrl: locationType === 'online' ? virtualUrl : undefined,
          startAt: new Date(startAt).toISOString(),
          endAt: new Date(endAt).toISOString(),
          timezone,
          requireApproval: requireApprovalGlobal,
          maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : undefined,
          calendarSlug: calendarSlug || undefined,
          tickets: formattedTickets,
          merchandises: formattedMerchandise,
        });

        toast.success('Event updated successfully!');
        router.push(`/${updatedEvent.slug}`);
      } else {
        // CREATE NEW EVENT
        const newEvent = await createEvent({
          name: name.trim(),
          description: description.trim() || 'Join us for this gathering!',
          coverUrl,
          hostAvatarUrl: hostAvatar || user?.avatarUrl,
          hostName: user?.name,
          hostEmail: user?.email,
          userId: user?.id,
          category: categories,
          tintColor,
          font,
          locationType,
          address: locationType === 'offline' ? address : undefined,
          city: locationType === 'offline' ? city : undefined,
          virtualUrl: locationType === 'online' ? virtualUrl : undefined,
          startAt: new Date(startAt).toISOString(),
          endAt: new Date(endAt).toISOString(),
          timezone,
          requireApproval: requireApprovalGlobal,
          maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : undefined,
          calendarSlug: calendarSlug || undefined,
          tickets: formattedTickets,
          merchandises: formattedMerchandise,
        });

        toast.success('Event published successfully!');
        router.push(`/${newEvent.slug}`);
      }
    } catch (err: any) {
      console.error('Failed to submit event:', err);
      const msg = err.message || (isEditMode ? 'Failed to update event' : 'Failed to create event');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCalendar = calendars.find((c) => c.slug === calendarSlug);

  if (isLoadingEdit) {
    return (
      <div className="min-h-screen bg-[#0e1626] flex items-center justify-center text-white space-y-3 flex-col">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-xs text-white/50">Loading event details...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen text-white antialiased selection:bg-white/20 ${fontClass} transition-colors duration-500`}
      style={{ backgroundColor: pageBg }}
    >
      {/* ================= STICKY TOP NAVIGATION & TOOLBAR ================= */}
      <div
        className="sticky top-11 z-40 w-full backdrop-blur-md transition-colors duration-200 py-3 sm:py-2"
        style={{
          backgroundColor: `color-mix(in srgb, ${pageBg} 80%, transparent)`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Top Row on mobile: Back button (left) & Action button (right) */}
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <Link
                href={isEditMode && editSlug ? `/${editSlug}` : '/'}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white transition-colors py-1.5 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{isEditMode ? 'Back to Event' : 'Back to Events'}</span>
                <span className="sm:hidden">{isEditMode ? 'Back' : 'Events'}</span>
              </Link>

              {/* Mobile-only Action button */}
              <div className="sm:hidden flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 active:scale-95 transition-all shadow-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      <span>{isEditMode ? 'Saving...' : 'Publishing...'}</span>
                    </>
                  ) : isEditMode ? (
                    <span>Save Changes</span>
                  ) : (
                    <span>Create</span>
                  )}
                </button>
              </div>
            </div>

            {/* Tools & Desktop Action button */}
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
              {/* Surface Tint Color Palette Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-medium text-white transition-all shadow-sm"
                  title="Change Background Surface Tint & Palette"
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full ring-1 ring-white/30 flex-shrink-0"
                    style={{ backgroundColor: tintColor }}
                  />
                  <span className="text-xs">Theme Tint</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/60" />
                </button>

                {/* Tint Dropdown Popover (Opens Downward) */}
                {isThemePickerOpen && (
                  <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-64 p-3 rounded-2xl bg-[#141a24] border border-white/15 shadow-2xl z-50 space-y-3">
                    <div className="text-xs font-semibold text-white/80 flex items-center justify-between">
                      <span>Surface Tint & Colors</span>
                      <X
                        className="w-3.5 h-3.5 text-white/40 cursor-pointer hover:text-white"
                        onClick={() => setIsThemePickerOpen(false)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {PRESET_TINTS.map((t) => (
                        <button
                          key={t.hex}
                          type="button"
                          onClick={() => {
                            setTintColor(t.hex);
                            setIsThemePickerOpen(false);
                          }}
                          className="group relative flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-white/5 transition-all"
                          title={t.name}
                        >
                          <div
                            className={`w-7 h-7 rounded-full ring-2 transition-transform ${tintColor === t.hex ? 'ring-white scale-110 shadow-lg' : 'ring-white/20 group-hover:scale-105'
                              }`}
                            style={{ backgroundColor: t.hex }}
                          />
                          <span className="text-[10px] text-white/60 truncate w-full text-center">
                            {t.name.split(' ')[0]}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Custom Hex Color Picker Input */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                      <span>Custom Color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={tintColor}
                          onChange={(e) => setTintColor(e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-[11px] font-mono text-white/90">{tintColor}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Font Picker Selector */}
              <div className="flex items-center rounded-full bg-white/10 p-0.5 border border-white/10 text-xs">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFont(f.id)}
                    className={`px-2 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all ${font === f.id
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-white/70 hover:text-white'
                      }`}
                    title={f.label}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              {/* Desktop Action button */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-3 sm:px-4 py-1.5 rounded-full bg-white text-black font-bold text-xs sm:text-sm hover:bg-white/90 active:scale-95 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      <span>{isEditMode ? 'Saving...' : 'Publishing...'}</span>
                    </>
                  ) : isEditMode ? (
                    <span>Save Changes</span>
                  ) : (
                    <span>Create</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN LIVE CANVAS ================= */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-32">
        {/* Validation Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <X className="w-4 h-4 cursor-pointer hover:text-white" onClick={() => setError(null)} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ================= LEFT COLUMN (Poster, Hosted By, Calendar, Category, Attendees) ================= */}
          <div className="md:col-span-5 space-y-6">
            {/* Poster Cover Card (Clickable to change) */}
            <div
              onClick={() => setIsCoverModalOpen(true)}
              className="group relative w-full rounded-2xl aspect-[3/4] overflow-hidden border border-white/10 shadow-2xl bg-black/40 cursor-pointer transition-transform hover:scale-[1.01]"
              title="Click to change poster cover image"
            >
              <img
                src={coverUrl}
                alt="Event Cover"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-4 text-center">
                <Upload className="w-6 h-6 text-white" />
                <span className="text-xs font-bold tracking-wide">Change Cover Poster</span>
                <span className="text-[10px] text-white/70">Click to choose presets or upload image</span>
              </div>
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-semibold text-white/90 border border-white/20">
                Change Cover
              </div>
            </div>

            {/* Hosted By Section */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-semibold text-white/50">Hosted By</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between group p-2 rounded-xl hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-2.5">
                    <div
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/20 cursor-pointer group/avatar"
                      title="Click to change avatar photo"
                    >
                      <img
                        src={hostAvatar}
                        alt="Host Avatar"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-[8px] text-white font-bold">
                        Edit
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white/95">
                        {user?.name || 'Community Host'}
                      </div>
                      <div className="text-[10px] text-white/40">
                        {user ? user.email : 'Log in to link your host profile'}
                      </div>
                    </div>
                  </div>

                  {!user && (
                    <button
                      type="button"
                      onClick={openAuthModal}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20"
                    >
                      Sign In
                    </button>
                  )}
                </div>

                {/* Community Calendar Link & Selector */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-2.5 text-xs min-w-0">
                    {selectedCalendar?.avatarUrl ? (
                      <img
                        src={selectedCalendar.avatarUrl}
                        alt={selectedCalendar.name}
                        className="w-5 h-5 rounded-md object-cover flex-shrink-0"
                      />
                    ) : (
                      <CalIcon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <span className="text-white/40 text-[10px] block">Community Calendar</span>
                      {selectedCalendar ? (
                        <span className="text-white font-semibold truncate block">
                          {selectedCalendar.name}
                        </span>
                      ) : (
                        <span className="text-white/40 italic text-[11px] block">
                          None (Personal Event)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {selectedCalendar && (
                      <button
                        type="button"
                        onClick={() => {
                          setCalendarSlug('');
                          toast.info('Calendar unlinked (Personal Event)');
                        }}
                        className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                        title="Remove / Unlink calendar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsNewCalendarModalOpen(true)}
                      className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-medium text-white transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{selectedCalendar ? 'Change' : 'Calendar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Going Attendees Preview */}
            <div className="pt-4 border-t border-white/[0.08] space-y-2">
              <h3 className="text-xs font-semibold text-white/50">1 Going</h3>
              <div className="flex items-center -space-x-1.5 overflow-hidden py-0.5">
                <img
                  src={hostAvatar}
                  alt="Host"
                  className="inline-block w-6 h-6 rounded-full ring-2 ring-black/40 object-cover"
                />
              </div>
              <p className="text-xs text-white/60">
                You are hosting this event
              </p>
            </div>

            {/* Category Multiselect */}
            <div className="pt-2 border-t border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/50">Category</span>
                {categories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategories([]);
                      toast.info('Categories cleared');
                    }}
                    className="text-[11px] text-white/40 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <MultipleSelector
                commandProps={{
                  label: 'Select categories',
                }}
                value={categories.map((cat) => ({
                  value: cat,
                  label: cat.startsWith('#') ? cat : `#${cat}`,
                }))}
                defaultOptions={categoriesList.map((cat) => {
                  const tag = cat.startsWith('#') ? cat : `#${cat}`;
                  return { value: tag, label: tag };
                })}
                onChange={(newOptions) => {
                  const formatted = newOptions.map((opt) =>
                    opt.value.startsWith('#') ? opt.value : `#${opt.value}`
                  );
                  setCategories(formatted);
                }}
                placeholder="Select or type #category..."
                hidePlaceholderWhenSelected
                emptyIndicator={<p className="text-center text-xs text-white/50 py-2">No categories found</p>}
                className="w-full"
                creatable
              />
            </div>
          </div>

          {/* ================= RIGHT COLUMN (Live Editable Event Details) ================= */}
          <div className="md:col-span-7 space-y-6">
            {/* Event Title Input */}
            <div className="space-y-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name Your Event..."
                className="w-full text-2xl sm:text-4xl font-extrabold text-white placeholder-white/30 bg-transparent border-b border-transparent hover:border-white/20 focus:border-white/50 focus:outline-none tracking-tight pb-1 transition-all"
                autoFocus={!isEditMode}
              />
              <p className="text-[11px] text-white/40">
                Type directly to name your event.
              </p>
            </div>

            {/* Date & Time Row Card */}
            <div
              className="p-4 sm:p-5 rounded-2xl border transition-all"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <div className="flex items-start gap-4">
                {/* Date Squircle Badge */}
                <div
                  className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-white/10 shadow-inner"
                  style={{ backgroundColor: squircleBg }}
                >
                  <span className="text-[10px] font-bold tracking-wider text-red-400 leading-none">
                    {dateInfo.month}
                  </span>
                  <span className="text-base font-extrabold text-white leading-none mt-1">
                    {dateInfo.day}
                  </span>
                </div>

                {/* Date Details & Inputs */}
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="text-sm font-bold text-white">
                      {dateInfo.fullDate}
                    </div>
                    <div className="text-xs text-white/60">
                      {dateInfo.timeRange} ({timezone})
                    </div>
                  </div>

                  {/* Inline Date/Time pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs">
                    <div>
                      <label className="text-[11px] text-white/50 block mb-1">Start Time</label>
                      <input
                        type="datetime-local"
                        value={startAt}
                        onChange={(e) => setStartAt(e.target.value)}
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-white/30"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-white/50 block mb-1">End Time</label>
                      <input
                        type="datetime-local"
                        value={endAt}
                        onChange={(e) => setEndAt(e.target.value)}
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-white/30"
                      />
                    </div>
                  </div>

                  {/* Timezone picker */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 text-xs text-white/60">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-white/40" />
                      <span>Timezone:</span>
                    </div>
                    <div className="w-full sm:w-64">
                      <Select value={timezone} onValueChange={(val) => setTimezone(val)}>
                        <SelectTrigger className="w-full h-8 text-xs bg-white/[0.05] border-white/10 text-white rounded-xl">
                          <SelectValue placeholder="Select a timezone" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80 bg-[#141a24] border-white/10 text-white">
                          {TIMEZONE_GROUPS.map((group) => (
                            <SelectGroup key={group.name}>
                              <SelectLabel>{group.name}</SelectLabel>
                              {group.items.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Row Card */}
            <div
              className="p-4 sm:p-5 rounded-2xl border transition-all"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <div className="flex items-start gap-4">
                {/* MapPin Squircle Badge */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 shadow-inner"
                  style={{ backgroundColor: squircleBg }}
                >
                  <MapPin className="w-5 h-5 text-red-400" />
                </div>

                {/* Location Details & Mode Switch */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">
                        {locationType === 'online' ? 'Online Virtual Event' : address || 'Set Event Location'}
                      </div>
                      <div className="text-xs text-white/60">
                        {locationType === 'online' ? 'Link provided to confirmed guests' : city || 'Jakarta, Indonesia'}
                      </div>
                    </div>

                    {/* Mode Toggle Pills */}
                    <div className="flex items-center rounded-xl bg-white/10 p-0.5 border border-white/10 text-xs">
                      <button
                        type="button"
                        onClick={() => setLocationType('offline')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${locationType === 'offline' ? 'bg-white text-black' : 'text-white/70 hover:text-white'
                          }`}
                      >
                        On Site
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocationType('online')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${locationType === 'online' ? 'bg-white text-black' : 'text-white/70 hover:text-white'
                          }`}
                      >
                        Online
                      </button>
                    </div>
                  </div>

                  {/* Location Inputs */}
                  {locationType === 'offline' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs">
                      <div>
                        <label className="text-[11px] text-white/50 block mb-1">Venue / Address</label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. Senayan City Mall"
                          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-white/30"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-white/50 block mb-1">City / Region</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Jakarta"
                          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-white/30"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-white/10 text-xs">
                      <label className="text-[11px] text-white/50 block mb-1">Virtual Stream / Meeting Link</label>
                      <input
                        type="url"
                        value={virtualUrl}
                        onChange={(e) => setVirtualUrl(e.target.value)}
                        placeholder="e.g. https://meet.google.com/xyz or Zoom link"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-white/30"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Registration & Tickets Setup Card */}
            <div
              className="p-5 sm:p-6 rounded-2xl border transition-all space-y-4"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {/* <TicketIcon className="w-4 h-4 text-emerald-400" /> */}
                    <span>Registration & Ticket Tiers</span>
                  </h3>
                  <p className="text-xs text-white/50">
                    Setup ticket pricing, approval rules, and guest capacities
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddTicketTier}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tickets</span>
                </button>
              </div>

              {/* Ticket Tiers List */}
              <div className="space-y-3">
                {ticketTiers.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={ticket.name}
                          onChange={(e) => handleUpdateTicketTier(ticket.id, { name: e.target.value })}
                          className="w-full font-bold text-sm bg-transparent border-b border-transparent hover:border-white/20 focus:border-white/50 focus:outline-none text-white"
                          placeholder="Ticket Name (e.g. General Admission)"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Ticket Type Select */}
                        <div className="w-36">
                          <Select
                            value={ticket.type}
                            onValueChange={(val) => handleUpdateTicketTier(ticket.id, { type: val as any })}
                          >
                            <SelectTrigger className="w-full h-7 text-xs bg-black/50 border-white/15 text-white rounded-lg px-2">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="w-44 bg-[#141a24] border border-white/10 text-white">
                              {TICKET_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {ticketTiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTicketTier(ticket.id)}
                            className="p-1 text-white/40 hover:text-red-400 transition-colors"
                            title="Remove ticket tier"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Price & Capacity Inputs */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      {ticket.type === 'paid' || ticket.type === 'vip' ? (
                        <div>
                          <label className="text-[10px] text-white/50 block mb-1">Price ({ticket.currency})</label>
                          <input
                            type="number"
                            min="0"
                            value={ticket.price}
                            onChange={(e) => handleUpdateTicketTier(ticket.id, { price: Number(e.target.value) })}
                            className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="text-[10px] text-white/50 block mb-1">Price</label>
                          <div className="text-emerald-400 font-bold text-xs py-1.5">Free</div>
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] text-white/50 block mb-1">Capacity</label>
                        <input
                          type="number"
                          min="1"
                          value={ticket.capacity}
                          onChange={(e) => handleUpdateTicketTier(ticket.id, { capacity: e.target.value })}
                          placeholder="Unlimited"
                          className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none"
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:justify-end gap-2 pt-4 sm:pt-0">
                        <label className="text-[11px] text-white/60 cursor-pointer flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={ticket.requireApproval}
                            onChange={(e) => handleUpdateTicketTier(ticket.id, { requireApproval: e.target.checked })}
                            className="rounded bg-white/10 border-white/20 text-blue-500"
                          />
                          <span>Waitlist / Approval</span>
                        </label>
                      </div>
                    </div>

                    {/* Ticket description */}
                    <input
                      type="text"
                      value={ticket.description}
                      onChange={(e) => handleUpdateTicketTier(ticket.id, { description: e.target.value })}
                      placeholder="Brief note about what this ticket includes..."
                      className="w-full text-xs text-white/70 bg-transparent border-b border-transparent hover:border-white/10 focus:border-white/30 focus:outline-none placeholder-white/30"
                    />

                    {/* Sale Start & End Dates (Presale Support) */}
                    <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-white/50">
                        <span className="flex items-center gap-1 font-medium text-white/70">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Sale Window (Presale / Early Bird)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateTicketTier(ticket.id, {
                              saleStartAt: startAt,
                              saleEndAt: endAt,
                            })
                          }
                          className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Follow Event Dates
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-white/40 block mb-0.5">Sale Starts</label>
                          <input
                            type="datetime-local"
                            value={ticket.saleStartAt || startAt}
                            onChange={(e) =>
                              handleUpdateTicketTier(ticket.id, { saleStartAt: e.target.value })
                            }
                            className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1 text-white text-[11px] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 block mb-0.5">Sale Ends</label>
                          <input
                            type="datetime-local"
                            value={ticket.saleEndAt || endAt}
                            onChange={(e) =>
                              handleUpdateTicketTier(ticket.id, { saleEndAt: e.target.value })
                            }
                            className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1 text-white text-[11px] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Global Approval Switch */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/80">
                <div>
                  <span className="font-semibold block text-white">Require Approval for all tickets</span>
                  <span className="text-[11px] text-white/50">Guests will join a waitlist and receive an invite upon your approval</span>
                </div>
                <input
                  type="checkbox"
                  checked={requireApprovalGlobal}
                  onChange={(e) => setRequireApprovalGlobal(e.target.checked)}
                  className="w-4 h-4 rounded bg-white/10 border-white/20 text-blue-500 cursor-pointer"
                />
              </div>
            </div>

            {/* ================= EVENT MERCHANDISE SECTION ================= */}
            <div
              className="p-4 sm:p-5 rounded-2xl border space-y-4 shadow-xl backdrop-blur-sm"
              style={{
                backgroundColor: cardBg,
                borderColor: cardBorder,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {/* <Sparkles className="w-4 h-4 text-amber-400" /> */}
                    <span>Event Merchandise & Add-ons</span>
                  </h3>
                  <p className="text-xs text-white/50">
                    Offer official merchandise or optional add-ons to your attendees
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddMerchandise}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Item</span>
                </button>
              </div>

              {merchandises.length === 0 ? (
                <div className="py-6 text-center border border-dashed border-white/10 rounded-xl space-y-2">
                  <p className="text-xs text-white/40">No merchandise added yet</p>
                  <button
                    type="button"
                    onClick={handleAddMerchandise}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add your first merchandise item</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {merchandises.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Item Photo thumbnail (Clickable upload) */}
                        <label
                          htmlFor={`merch-file-${item.id}`}
                          className="w-16 h-16 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/30 overflow-hidden flex-shrink-0 relative group cursor-pointer transition-all flex flex-col items-center justify-center text-center shadow-sm"
                          title="Click to upload merchandise photo"
                        >
                          {item.imageUrl ? (
                            <>
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-0.5">
                                <Camera className="w-4 h-4" />
                                <span className="text-[9px] font-semibold">Change</span>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/40 group-hover:text-white group-hover:bg-white/[0.06] transition-all p-1">
                              <Camera className="w-4 h-4 mb-0.5" />
                              <span className="text-[9px] font-medium leading-none">Upload</span>
                            </div>
                          )}
                          <input
                            id={`merch-file-${item.id}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMerchandiseImageUpload(item.id, e)}
                            className="hidden"
                          />
                        </label>

                        <div className="flex-1 space-y-1.5 min-w-0">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateMerchandise(item.id, { name: e.target.value })}
                            placeholder="Item Name (e.g. Official T-Shirt)"
                            className="w-full font-bold text-sm bg-transparent border-b border-transparent hover:border-white/20 focus:border-white/50 focus:outline-none text-white"
                          />
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateMerchandise(item.id, { description: e.target.value })}
                            placeholder="Description (e.g. 100% Cotton, sizes S-XL)"
                            className="w-full text-xs text-white/70 bg-transparent border-b border-transparent hover:border-white/10 focus:border-white/30 focus:outline-none placeholder-white/30"
                          />

                          {/* Upload button & Clear */}
                          <div className="flex items-center gap-2 pt-0.5">
                            <label
                              htmlFor={`merch-file-${item.id}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white/70 hover:text-white cursor-pointer transition-colors"
                            >
                              <Upload className="w-3 h-3" />
                              <span>{item.imageUrl ? 'Change Photo' : 'Upload Photo'}</span>
                            </label>
                            {item.imageUrl && (
                              <button
                                type="button"
                                onClick={() => handleUpdateMerchandise(item.id, { imageUrl: '' })}
                                className="text-[10px] text-white/40 hover:text-red-400 transition-colors"
                              >
                                Remove Photo
                              </button>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveMerchandise(item.id)}
                          className="p-1 text-white/40 hover:text-red-400 transition-colors flex-shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price, Stock & Photo URL */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                        <div>
                          <label className="text-[10px] text-white/50 block mb-1">Price ({item.currency})</label>
                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) => handleUpdateMerchandise(item.id, { price: Number(e.target.value) })}
                            className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/50 block mb-1">Stock Limit</label>
                          <input
                            type="number"
                            min="1"
                            value={item.stock}
                            onChange={(e) => handleUpdateMerchandise(item.id, { stock: e.target.value })}
                            placeholder="Unlimited"
                            className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="text-[10px] text-white/50 block mb-1">Photo URL</label>
                          <input
                            type="url"
                            value={item.imageUrl}
                            onChange={(e) => handleUpdateMerchandise(item.id, { imageUrl: e.target.value })}
                            placeholder="https://..."
                            className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Quick Presets for Photo */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] text-white/40">Presets:</span>
                        {[
                          { label: '👕 T-Shirt', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80' },
                          { label: '👜 Tote Bag', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80' },
                          { label: '🧢 Cap', url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80' },
                          { label: '🥤 Tumbler', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80' },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => handleUpdateMerchandise(item.id, { imageUrl: preset.url })}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/5"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* About Event Description Card (Inline Textarea) */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-semibold text-white/50">About Event</h3>
              <textarea
                rows={7}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write about your event... What's on the agenda? Who are the guest speakers? What should attendees bring?"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm text-white/90 placeholder-white/40 focus:outline-none focus:border-white/30 leading-relaxed resize-y"
              />
              <p className="text-[11px] text-white/40">
                Supports markdown and multi-line formatting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL: CHANGE COVER POSTER ================= */}
      {isCoverModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-[#131924] border border-white/15 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Choose Cover Poster</h3>
                <p className="text-xs text-white/50">Pick from curated aesthetic presets or upload your own</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCoverModalOpen(false)}
                className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-white/70">Curated Presets</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                {PRESET_COVERS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setCoverUrl(preset.portraitUrl);
                      setIsCoverModalOpen(false);
                      toast.success(`Selected "${preset.name}"`);
                    }}
                    className={`group relative rounded-xl aspect-[3/4] overflow-hidden border cursor-pointer transition-all ${coverUrl === preset.portraitUrl
                      ? 'border-blue-500 ring-2 ring-blue-500/50'
                      : 'border-white/10 hover:border-white/30'
                      }`}
                  >
                    <img src={preset.portraitUrl} alt={preset.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                      <p className="text-[11px] font-bold text-white truncate">{preset.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload or URL */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 transition-all flex items-center justify-center gap-2 flex-1"
              >
                <Upload className="w-4 h-4" />
                <span>Upload From Device</span>
              </button>
              <div className="flex-1 w-full flex items-center gap-2">
                <input
                  type="url"
                  placeholder="Paste image link URL..."
                  value={customCoverInput}
                  onChange={(e) => setCustomCoverInput(e.target.value)}
                  className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customCoverInput.trim()) {
                      setCoverUrl(customCoverInput.trim());
                      setCustomCoverInput('');
                      setIsCoverModalOpen(false);
                      toast.success('Cover image updated');
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CUSTOM CATEGORY ================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#131924] border border-white/15 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Event Category</h3>
                <p className="text-xs text-white/50">Select from list or create your own custom category</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/70">Create New Custom Category</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Web3 Hackathon, Photography, Dance"
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomCategory();
                    }
                  }}
                  className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCategory}
                  className="px-3.5 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Existing Categories */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/60">Categories</span>
                {categories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategories([]);
                      setIsCategoryModalOpen(false);
                      toast.info('Categories cleared');
                    }}
                    className="text-[11px] text-white/40 hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setCategories([]);
                    setIsCategoryModalOpen(false);
                    toast.info('Categories cleared');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${categories.length === 0
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-white/60'
                    }`}
                >
                  None (No Category)
                </button>
                {categoriesList.map((cat) => {
                  const tag = cat.startsWith('#') ? cat : `#${cat}`;
                  const isSelected = categories.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setCategories(categories.filter((c) => c !== tag));
                        } else {
                          setCategories([...categories, tag]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isSelected
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-white/80'
                        }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE NEW CALENDAR ================= */}
      {isNewCalendarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#131924] border border-white/15 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Create Community Calendar</h3>
                <p className="text-xs text-white/50">Host recurring events under your organization or club</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewCalendarModalOpen(false)}
                className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCalendar} className="space-y-4">
              {/* Banner & Avatar Upload Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-white/70">
                  <span>Cover Banner & Avatar</span>
                  <span className="text-[10px] text-white/40">Visual identity for your calendar</span>
                </div>

                {/* Banner box */}
                <div className="relative w-full h-28 sm:h-32 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] group/banner">
                  {newCalendarCover ? (
                    <>
                      <img
                        src={newCalendarCover}
                        alt="Calendar Banner"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => calendarCoverInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-all"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Change Banner</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewCalendarCover('')}
                          className="px-2.5 py-1.5 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-red-200 text-xs backdrop-blur-md transition-all flex items-center gap-1"
                          title="Remove Banner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => calendarCoverInputRef.current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center gap-1 text-white/50 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer p-4 text-center border-dashed border border-white/15 rounded-2xl"
                    >
                      <ImageIcon className="w-5 h-5 mb-0.5 text-white/40" />
                      <span className="text-xs font-medium">Click to Upload Calendar Banner</span>
                      <span className="text-[10px] text-white/30">PNG, JPG or WebP (Recommended 1200x400)</span>
                    </button>
                  )}
                </div>

                {/* Avatar Box & Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/20 bg-white/[0.05] flex-shrink-0 group/ava shadow-md">
                    {newCalendarAvatar ? (
                      <>
                        <img
                          src={newCalendarAvatar}
                          alt="Calendar Avatar"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => calendarAvatarInputRef.current?.click()}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover/ava:opacity-100 transition-opacity flex items-center justify-center text-white"
                          title="Change Avatar"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => calendarAvatarInputRef.current?.click()}
                        className="w-full h-full flex flex-col items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
                        title="Upload Avatar"
                      >
                        <Camera className="w-4 h-4 text-white/40" />
                        <span className="text-[9px] mt-0.5 font-medium">Ava</span>
                      </button>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => calendarAvatarInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-medium text-white transition-all flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{newCalendarAvatar ? 'Change Avatar' : 'Upload Avatar'}</span>
                      </button>
                      {newCalendarAvatar && (
                        <button
                          type="button"
                          onClick={() => setNewCalendarAvatar('')}
                          className="text-xs text-white/40 hover:text-red-400 px-2 py-1 transition-colors"
                          title="Remove Avatar"
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
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">Calendar Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jakarta AI Society, UI/UX Jakarta"
                  value={newCalendarName}
                  onChange={(e) => setNewCalendarName(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Tell people what gatherings this calendar hosts..."
                  value={newCalendarDescription}
                  onChange={(e) => setNewCalendarDescription(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              {/* Select Existing or No Calendar (Only user-created calendars) */}
              {myCalendars.length > 0 && (
                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <span className="text-xs text-white/50">Your Calendars:</span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setCalendarSlug('');
                        setIsNewCalendarModalOpen(false);
                        toast.info('Set to Personal Event (No calendar)');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${calendarSlug === ''
                        ? 'bg-white text-black font-semibold'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                        }`}
                    >
                      No Calendar (Personal)
                    </button>
                    {myCalendars.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCalendarSlug(c.slug);
                          setIsNewCalendarModalOpen(false);
                          toast.success(`Linked to ${c.name}`);
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${calendarSlug === c.slug
                          ? 'bg-white text-black font-semibold'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                          }`}
                      >
                        {c.avatarUrl && (
                          <img
                            src={c.avatarUrl}
                            alt={c.name}
                            className="w-3.5 h-3.5 rounded-sm object-cover"
                          />
                        )}
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCalendarModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCalendar}
                  className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 disabled:opacity-50"
                >
                  {isCreatingCalendar ? 'Creating...' : 'Create & Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={coverFileInputRef}
        onChange={handleCoverUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={avatarFileInputRef}
        onChange={handleAvatarUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={calendarCoverInputRef}
        onChange={handleCalendarCoverUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={calendarAvatarInputRef}
        onChange={handleCalendarAvatarUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0e1626] flex items-center justify-center text-white space-y-3 flex-col">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-xs text-white/50">Loading editor...</p>
        </div>
      }
    >
      <CreateEventForm />
    </Suspense>
  );
}
