import {
  filterMockEvents,
  findMockCalendarBySlug,
  findMockEventBySlug,
  getMockUser,
  MOCK_CALENDARS,
  MOCK_CATEGORIES,
  MOCK_CITIES,
  MOCK_EVENTS,
  MOCK_HOSTS,
} from './seedData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4450/api';

const isForceMock = () => process.env.NEXT_PUBLIC_FORCE_MOCK === 'true';
const shouldFallbackToMock = () => {
  if (isForceMock()) return true;
  return process.env.NEXT_PUBLIC_ENABLE_MOCK_FALLBACK !== 'false';
};

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
  if (!isForceMock()) {
    try {
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
    } catch (err) {
      if (!shouldFallbackToMock()) throw err;
      console.warn('[Helio API] Backend offline, displaying seed data for events.');
    }
  }

  return filterMockEvents(params);
}

export async function fetchEventBySlug(slug: string): Promise<EventItem> {
  if (!isForceMock()) {
    try {
      const res = await fetch(`${API_BASE}/events/${slug}`, { cache: 'no-store' });
      return await handleResponse<EventItem>(res, 'Failed to fetch event');
    } catch (err) {
      if (!shouldFallbackToMock()) throw err;
      console.warn(`[Helio API] Backend offline, displaying seed data for event: ${slug}`);
    }
  }

  const mock = findMockEventBySlug(slug);
  if (mock) return mock;
  throw new Error('Event not found in seed data');
}

export async function createEvent(data: any): Promise<EventItem> {
  if (!isForceMock()) {
    try {
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
      return await handleResponse<EventItem>(res, 'Failed to create event');
    } catch (err) {
      if (!shouldFallbackToMock()) throw err;
    }
  }

  const newEvt: EventItem = {
    id: `evt-${Date.now()}`,
    slug: data.slug || `event-${Date.now()}`,
    name: data.name || 'New Community Event',
    description: data.description || '',
    coverUrl: data.coverUrl || 'https://images.lumacdn.com/uploads/ul/347bf4cf-3703-4559-9b27-c3ffc37e1dd7.png',
    startAt: data.startAt || new Date().toISOString(),
    endAt: data.endAt || new Date().toISOString(),
    timezone: data.timezone || 'UTC',
    locationType: data.locationType || 'offline',
    address: data.address,
    city: data.city || 'San Francisco',
    requireApproval: Boolean(data.requireApproval),
    category: data.category || ['#Tech'],
    tintColor: data.tintColor || '#2e72e0',
    host: MOCK_HOSTS.alexa,
    tickets: data.tickets || [],
  };
  MOCK_EVENTS.unshift(newEvt);
  return newEvt;
}

export async function updateEvent(slugOrId: string, data: any): Promise<EventItem> {
  if (!isForceMock()) {
    try {
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
      return await handleResponse<EventItem>(res, 'Failed to update event');
    } catch (err) {
      if (!shouldFallbackToMock()) throw err;
    }
  }

  const existing = findMockEventBySlug(slugOrId);
  if (existing) {
    Object.assign(existing, data);
    return existing;
  }
  throw new Error('Event not found');
}

export async function registerForEvent(
  eventId: string,
  payload: { name: string; email: string; ticketId?: string; notes?: string; answers?: any }
): Promise<Registration> {
  if (!isForceMock()) {
    try {
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
      return await handleResponse<Registration>(res, 'Failed to register');
    } catch (err) {
      if (!shouldFallbackToMock()) throw err;
    }
  }

  return {
    id: `reg-mock-${Date.now()}`,
    eventId,
    ticketId: payload.ticketId,
    name: payload.name,
    email: payload.email,
    status: 'APPROVED',
    ticketKey: `helio-mock-pass-${Date.now()}`,
    qrCode: '',
    notes: payload.notes,
    createdAt: new Date().toISOString(),
  };
}

export async function fetchCalendars(): Promise<Calendar[]> {
  if (!isForceMock()) {
    try {
      const res = await fetch(`${API_BASE}/calendars`, { cache: 'no-store' });
      return await handleResponse<Calendar[]>(res, 'Failed to fetch calendars');
    } catch (err) {
      if (!shouldFallbackToMock()) throw err;
      console.warn('[Helio API] Backend offline, displaying seed data for calendars.');
    }
  }
  return MOCK_CALENDARS;
}

export async function fetchCalendarBySlug(slug: string): Promise<Calendar & { events: EventItem[]; owner: Host }> {
  if (!isForceMock()) {
    try {
      const res = await fetch(`${API_BASE}/calendars/${slug}`, { cache: 'no-store' });
      return await handleResponse<Calendar & { events: EventItem[]; owner: Host }>(res, 'Failed to fetch calendar');
    } catch (err) {
      if (!shouldFallbackToMock()) throw err;
      console.warn(`[Helio API] Backend offline, displaying seed data for calendar: ${slug}`);
    }
  }

  const mock = findMockCalendarBySlug(slug);
  if (mock) return mock;
  throw new Error('Calendar not found in seed data');
}

export async function createCalendar(payload: {
  name: string;
  slug?: string;
  description?: string;
  avatarUrl?: string;
  coverUrl?: string;
  tintColor?: string;
}): Promise<Calendar> {
  if (!isForceMock()) {
    try {
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
      return await handleResponse<Calendar>(res, 'Failed to create calendar');
    } catch (err) {
      if (!shouldFallbackToMock()) throw err;
    }
  }

  const newCal: Calendar = {
    id: `cal-${Date.now()}`,
    slug: payload.slug || `cal-${Date.now()}`,
    name: payload.name,
    description: payload.description,
    avatarUrl: payload.avatarUrl,
    coverUrl: payload.coverUrl,
    tintColor: payload.tintColor || '#4286f5',
    subscriberCount: 1,
    owner: MOCK_HOSTS.alexa,
  };
  MOCK_CALENDARS.unshift(newCal);
  return newCal;
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
  if (!isForceMock()) {
    try {
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
      return await handleResponse<Calendar & { owner?: Host }>(res, 'Failed to update calendar');
    } catch (err) {
      if (!shouldFallbackToMock()) throw err;
    }
  }

  const cal = MOCK_CALENDARS.find((c) => c.slug === slug);
  if (cal) {
    Object.assign(cal, payload);
    return { ...cal, owner: MOCK_HOSTS.alexa };
  }
  throw new Error('Calendar not found');
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
  if (!isForceMock()) {
    try {
      const res = await fetch(`${API_BASE}/categories`, { cache: 'no-store' });
      return await handleResponse<CategoryItem[]>(res, 'Failed to fetch categories');
    } catch (err) {
      if (!shouldFallbackToMock()) throw err;
      console.warn('[Helio API] Backend offline, displaying seed data for categories.');
    }
  }
  return MOCK_CATEGORIES;
}

export async function fetchCities(): Promise<CityItem[]> {
  if (!isForceMock()) {
    try {
      const res = await fetch(`${API_BASE}/cities`, { cache: 'no-store' });
      return await handleResponse<CityItem[]>(res, 'Failed to fetch cities');
    } catch (err) {
      if (!shouldFallbackToMock()) throw err;
      console.warn('[Helio API] Backend offline, displaying seed data for cities.');
    }
  }
  return MOCK_CITIES;
}

export async function fetchGuests(eventId: string): Promise<Registration[]> {
  if (!isForceMock()) {
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/guests`, { cache: 'no-store' });
      return await handleResponse<Registration[]>(res, 'Failed to fetch guests');
    } catch (err) {
      if (!shouldFallbackToMock()) throw err;
    }
  }

  const event = findMockEventBySlug(eventId);
  return (
    event?.registrations?.map((r, i) => ({
      id: r.id,
      eventId: event.id,
      name: r.name,
      email: `${r.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      status: 'APPROVED' as const,
      ticketKey: `seed-ticket-${i}`,
      createdAt: new Date().toISOString(),
      user: r.user,
    })) || []
  );
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
  if (!isForceMock()) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await handleResponse<{ user: UserProfile; token: string }>(res, 'Failed to log in');
    } catch (err) {
      if (!shouldFallbackToMock()) throw err;
      console.warn('[Helio API] Backend offline, using mock user session.');
    }
  }

  const mockUser = getMockUser();
  mockUser.email = payload.email;
  return { user: mockUser, token: 'helio-mock-token-offline' };
}

export async function signupUser(payload: { name: string; email: string; password?: string }): Promise<{ user: UserProfile; token: string }> {
  if (!isForceMock()) {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await handleResponse<{ user: UserProfile; token: string }>(res, 'Failed to sign up');
    } catch (err) {
      if (!shouldFallbackToMock()) throw err;
      console.warn('[Helio API] Backend offline, using mock user session.');
    }
  }

  const mockUser = getMockUser();
  mockUser.name = payload.name;
  mockUser.email = payload.email;
  return { user: mockUser, token: 'helio-mock-token-offline' };
}

export async function fetchMe(token: string): Promise<UserProfile> {
  if (!isForceMock()) {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      return await handleResponse<UserProfile>(res, 'Failed to fetch current user profile');
    } catch (err) {
      if (!shouldFallbackToMock()) throw err;
    }
  }

  return getMockUser();
}

export async function updateProfile(token: string, payload: Partial<UserProfile>): Promise<UserProfile> {
  if (!isForceMock()) {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      return await handleResponse<UserProfile>(res, 'Failed to update profile');
    } catch (err) {
      if (!shouldFallbackToMock()) throw err;
    }
  }

  const user = getMockUser();
  Object.assign(user, payload);
  return user;
}

export async function fetchUserByUsername(username: string): Promise<UserProfile> {
  if (!isForceMock()) {
    try {
      const res = await fetch(`${API_BASE}/users/${encodeURIComponent(username)}`, {
        cache: 'no-store',
      });
      return await handleResponse<UserProfile>(res, 'Failed to fetch user profile');
    } catch (err) {
      if (!shouldFallbackToMock()) throw err;
      console.warn(`[Helio API] Backend offline, displaying seed data for user: ${username}`);
    }
  }

  return getMockUser(username);
}

