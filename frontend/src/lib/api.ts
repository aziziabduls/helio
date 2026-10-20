const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4450/api';

export interface Host {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  username?: string;
  website?: string;
  twitterHandle?: string;
  instagramHandle?: string;
  isVerified?: boolean;
}

export interface Calendar {
  id: string;
  slug: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  coverUrl?: string;
  tintColor?: string;
  subscriberCount?: number;
  ownerId?: string;
  owner?: Host;
}

export interface Ticket {
  id: string;
  name: string;
  description?: string;
  type: string;
  price: number;
  currency: string;
  capacity?: number;
  requireApproval: boolean;
  saleStartAt?: string;
  saleEndAt?: string;
}

export interface MerchandiseItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  stock?: number;
}

export interface EventItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverUrl: string;
  coverCardUrl?: string;
  startAt: string;
  endAt: string;
  timezone: string;
  locationType: 'offline' | 'online';
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  virtualUrl?: string;
  requireApproval: boolean;
  maxCapacity?: number;
  category: string | string[];
  tintColor: string;
  font?: string;
  host: Host;
  calendar?: Calendar;
  tickets: Ticket[];
  merchandises?: MerchandiseItem[];
  registrations?: {
    id: string;
    name: string;
    user?: { avatarUrl?: string | null } | null;
  }[];
  _count?: {
    registrations: number;
  };
}

export interface Registration {
  id: string;
  eventId: string;
  ticketId?: string;
  name: string;
  email: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'CHECKED_IN';
  ticketKey: string;
  qrCode?: string;
  notes?: string;
  createdAt: string;
  event?: EventItem;
  ticket?: Ticket;
  user?: {
    id?: string;
    name?: string;
    avatarUrl?: string | null;
  } | null;
}

async function handleResponse<T>(res: Response, defaultError = 'Request failed'): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const errorMsg =
      json.message ||
      json.error?.code ||
      (json.error && typeof json.error === 'string' ? json.error : defaultError);
    throw new Error(errorMsg);
  }
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T;
  }
  return json as T;
}

export async function fetchEvents(params?: {
  timeframe?: string;
  category?: string;
  city?: string;
  calendarSlug?: string;
  search?: string;
}): Promise<EventItem[]> {
  const query = new URLSearchParams();
  if (params?.timeframe) query.append('timeframe', params.timeframe);
  if (params?.category) query.append('category', params.category);
  if (params?.city) query.append('city', params.city);
  if (params?.calendarSlug) query.append('calendarSlug', params.calendarSlug);
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/events?${query.toString()}`, { cache: 'no-store' });
  const events = await handleResponse<EventItem[]>(res, 'Failed to fetch events');
  if (params?.timeframe === 'past') return events;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return events.filter((e) => new Date(e.startAt) >= today);
}

export async function fetchEventBySlug(slug: string): Promise<EventItem> {
  const res = await fetch(`${API_BASE}/events/${slug}`, { cache: 'no-store' });
  return handleResponse<EventItem>(res, 'Failed to fetch event');
}

export async function createEvent(data: any): Promise<EventItem> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('helio_auth_token') || localStorage.getItem('helio_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse<EventItem>(res, 'Failed to create event');
}

export async function updateEvent(slugOrId: string, data: any): Promise<EventItem> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('helio_auth_token') || localStorage.getItem('helio_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/events/${encodeURIComponent(slugOrId)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse<EventItem>(res, 'Failed to update event');
}

export async function registerForEvent(
  eventId: string,
  payload: { name: string; email: string; ticketId?: string; notes?: string; answers?: any }
): Promise<Registration> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('helio_auth_token') || localStorage.getItem('helio_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return handleResponse<Registration>(res, 'Failed to register');
}

export async function fetchCalendars(): Promise<Calendar[]> {
  const res = await fetch(`${API_BASE}/calendars`, { cache: 'no-store' });
  return handleResponse<Calendar[]>(res, 'Failed to fetch calendars');
}

export async function fetchCalendarBySlug(slug: string): Promise<Calendar & { events: EventItem[]; owner: Host }> {
  const res = await fetch(`${API_BASE}/calendars/${slug}`, { cache: 'no-store' });
  return handleResponse<Calendar & { events: EventItem[]; owner: Host }>(res, 'Failed to fetch calendar');
}

export async function createCalendar(payload: {
  name: string;
  slug?: string;
  description?: string;
  avatarUrl?: string;
  coverUrl?: string;
  tintColor?: string;
}): Promise<Calendar> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('helio_auth_token') || localStorage.getItem('helio_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/calendars`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return handleResponse<Calendar>(res, 'Failed to create calendar');
}

export async function updateCalendar(
  slug: string,
  payload: {
    name?: string;
    slug?: string;
    description?: string;
    avatarUrl?: string;
    coverUrl?: string;
    tintColor?: string;
  }
): Promise<Calendar & { owner?: Host }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('helio_auth_token') || localStorage.getItem('helio_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/calendars/${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload),
  });
  return handleResponse<Calendar & { owner?: Host }>(res, 'Failed to update calendar');
}

export interface CategoryItem {
  name: string;
  slug?: string;
  icon: string;
  count: string | number;
}

export interface CityItem {
  name: string;
  slug?: string;
  region?: string;
  continent?: string;
  icon: string;
  count: number;
  tint?: string;
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  const res = await fetch(`${API_BASE}/categories`, { cache: 'no-store' });
  return handleResponse<CategoryItem[]>(res, 'Failed to fetch categories');
}

export async function fetchCities(): Promise<CityItem[]> {
  const res = await fetch(`${API_BASE}/cities`, { cache: 'no-store' });
  return handleResponse<CityItem[]>(res, 'Failed to fetch cities');
}

export async function fetchGuests(eventId: string): Promise<Registration[]> {
  const res = await fetch(`${API_BASE}/events/${eventId}/guests`, { cache: 'no-store' });
  return handleResponse<Registration[]>(res, 'Failed to fetch guests');
}

export async function updateRegistrationStatus(id: string, status: string): Promise<Registration> {
  const res = await fetch(`${API_BASE}/registrations/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse<Registration>(res, 'Failed to update registration status');
}

export interface UserProfile extends Host {
  createdAt?: string;
  updatedAt?: string;
  events?: EventItem[];
  calendars?: Calendar[];
  registrations?: Registration[];
  _count?: {
    events: number;
    registrations: number;
  };
}

export async function loginUser(payload: { email: string; password?: string }): Promise<{ user: UserProfile; token: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ user: UserProfile; token: string }>(res, 'Failed to log in');
}

export async function signupUser(payload: { name: string; email: string; password?: string }): Promise<{ user: UserProfile; token: string }> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ user: UserProfile; token: string }>(res, 'Failed to sign up');
}

export async function fetchMe(token: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return handleResponse<UserProfile>(res, 'Failed to fetch current user profile');
}

export async function updateProfile(token: string, payload: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<UserProfile>(res, 'Failed to update profile');
}

export async function fetchUserByUsername(username: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(username)}`, {
    cache: 'no-store',
  });
  return handleResponse<UserProfile>(res, 'Failed to fetch user profile');
}

