import type { IEvent, IBooking, IAttendee, IUser } from './types';

// ── Category Labels ───────────────────────────────────────────
export const CATEGORY_LABELS: Record<string, string> = {
  music: 'Music',
  tech: 'Tech & Product',
  art: 'Art & Design',
  business: 'Business & Leadership',
  food: 'Food & Culinary',
  sports: 'Sports & Fitness',
  wellness: 'Mind & Wellness',
  community: 'Community',
};

// ── Mock Events ───────────────────────────────────────────────
export const MOCK_EVENTS: IEvent[] = [
  {
    id: 'evt_001',
    slug: 'ideomint-live-volume-01',
    title: 'Ideomint Live — Volume 01',
    tagline: 'Where sound meets creative design.',
    description:
      'The premiere edition of Ideomint Live brings together emerging artists, brand designers, and experience architects for an unforgettable night of music, installation art, and real-time brand activations in Colombo.',
    category: 'music',
    date: '2026-10-24T19:00:00+05:30',
    end_date: '2026-10-24T23:59:00+05:30',
    venue: 'Lotus Tower Exhibition Center',
    city: 'Colombo',
    country: 'Sri Lanka',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    gallery_urls: [],
    payment_methods: ['bank_transfer', 'payhere'],
    ticket_tiers: [
      { id: 'tier_001', name: 'early_bird', label: 'Early Bird', price: 3500, currency: 'LKR', capacity: 200, sold: 187, perks: ['General access', 'Welcome drink', 'Digital programme'] },
      { id: 'tier_002', name: 'standard', label: 'Standard', price: 5500, currency: 'LKR', capacity: 400, sold: 243, perks: ['General access', 'Welcome drink', 'Digital programme', 'Artist meet & greet ballot'] },
      { id: 'tier_003', name: 'vip', label: 'VIP Pass', price: 15000, currency: 'LKR', capacity: 50, sold: 31, perks: ['VIP lounge access', 'Open bar', 'Artist meet & greet guaranteed', 'Ideomint merch kit', 'Priority entry'] },
    ],
    organizer_id: 'org_001',
    organizer_name: 'Ideomint Studio',
    status: 'published',
    tags: ['music', 'design', 'brand', 'live', 'colombo'],
    featured: true,
    guest_booking_allowed: true,
  },
  {
    id: 'evt_002',
    slug: 'the-midnight-pulse',
    title: 'The Midnight Pulse',
    tagline: 'Deep techno. Deeper connections.',
    description:
      'The Midnight Pulse is a warehouse rave experience celebrating underground techno culture, generative visual art, and the raw energy of community at Port City Colombo.',
    category: 'music',
    date: '2026-11-12T23:00:00+05:30',
    end_date: '2026-11-13T06:00:00+05:30',
    venue: 'Port City Arena',
    city: 'Colombo',
    country: 'Sri Lanka',
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    gallery_urls: [],
    payment_methods: ['bank_transfer', 'payhere'],
    ticket_tiers: [
      { id: 'tier_004', name: 'early_bird', label: 'Early Bird', price: 2500, currency: 'LKR', capacity: 300, sold: 300, perks: ['Club entry', 'Coat check included'] },
      { id: 'tier_005', name: 'standard', label: 'Standard', price: 4000, currency: 'LKR', capacity: 500, sold: 341, perks: ['Club entry', 'Coat check included', 'Midnight welcome shot'] },
      { id: 'tier_006', name: 'vip', label: 'VIP Pass', price: 12000, currency: 'LKR', capacity: 40, sold: 22, perks: ['VIP table reservation', 'Bottle service', 'Backstage access'] },
    ],
    organizer_id: 'org_001',
    organizer_name: 'Ideomint Studio',
    status: 'published',
    tags: ['techno', 'rave', 'nightlife', 'colombo'],
    featured: true,
    guest_booking_allowed: true,
  },
  {
    id: 'evt_003',
    slug: 'the-open-forge',
    title: 'The Open Forge Summit',
    tagline: 'Build in public. Ship in style.',
    description:
      'A full-day builder summit for founders, product designers, and creative technologists. The Open Forge brings together 300 practitioners for talks, live demos, collaborative hacking sessions, and networking.',
    category: 'tech',
    date: '2026-12-05T09:00:00+05:30',
    end_date: '2026-12-05T20:00:00+05:30',
    venue: 'Cinnamon Grand Horizon Ballroom',
    city: 'Colombo',
    country: 'Sri Lanka',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    gallery_urls: [],
    payment_methods: ['bank_transfer', 'payhere', 'free'],
    ticket_tiers: [
      { id: 'tier_007', name: 'free', label: 'Free Community Pass', price: 0, currency: 'LKR', capacity: 100, sold: 89, perks: ['All talks', 'Networking breaks', 'Lunch included'] },
      { id: 'tier_008', name: 'standard', label: 'Maker Pass', price: 7500, currency: 'LKR', capacity: 150, sold: 112, perks: ['All talks', 'Workshop access', 'Lunch + dinner', 'Speaker slides deck'] },
      { id: 'tier_009', name: 'vip', label: 'Founder Pass', price: 25000, currency: 'LKR', capacity: 20, sold: 14, perks: ['Everything in Maker', '1:1 speaker office hours', 'VIP dinner with speakers'] },
    ],
    organizer_id: 'org_001',
    organizer_name: 'Ideomint Studio',
    status: 'published',
    tags: ['tech', 'startup', 'product', 'design', 'founder'],
    featured: false,
    guest_booking_allowed: true,
  },
];

// ── Mock Bookings ──────────────────────────────────────────────
export const MOCK_BOOKINGS: IBooking[] = [
  {
    id: 'bkg_001',
    booking_ref: 'IDF-A1B2C3D4',
    event_id: 'evt_001',
    ticket_tier_id: 'tier_003',
    event_slug: 'ideomint-live-volume-01',
    event_title: 'Ideomint Live — Volume 01',
    event_date: '2026-10-24T19:00:00+05:30',
    venue: 'Lotus Tower Exhibition Center',
    attendee_name: 'Aarav Sharma',
    attendee_email: 'aarav@example.com',
    attendee_phone: '+94 77 123 4567',
    attendee_nic: '199512345678',
    tier_name: 'vip',
    tier_label: 'VIP Pass',
    quantity: 2,
    unit_price: 15000,
    total_amount: 30000,
    currency: 'LKR',
    payment_method: 'bank_transfer',
    payment_status: 'paid',
    payment_slip_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
    status: 'confirmed',
    created_at: '2026-07-10T14:22:00+05:30',
  },
  {
    id: 'bkg_002',
    booking_ref: 'IDF-E5F6G7H8',
    event_id: 'evt_001',
    ticket_tier_id: 'tier_002',
    event_slug: 'ideomint-live-volume-01',
    event_title: 'Ideomint Live — Volume 01',
    event_date: '2026-10-24T19:00:00+05:30',
    venue: 'Lotus Tower Exhibition Center',
    attendee_name: 'Priya Nair',
    attendee_email: 'priya@example.com',
    attendee_phone: '+94 71 987 6543',
    attendee_nic: '199887654321',
    tier_name: 'standard',
    tier_label: 'Standard',
    quantity: 1,
    unit_price: 5500,
    total_amount: 5500,
    currency: 'LKR',
    payment_method: 'payhere',
    payment_status: 'paid',
    status: 'confirmed',
    created_at: '2026-07-12T09:11:00+05:30',
  },
  {
    id: 'bkg_003',
    booking_ref: 'IDF-SLIP9901',
    event_id: 'evt_001',
    ticket_tier_id: 'tier_003',
    event_slug: 'ideomint-live-volume-01',
    event_title: 'Ideomint Live — Volume 01',
    event_date: '2026-10-24T19:00:00+05:30',
    venue: 'Lotus Tower Exhibition Center',
    attendee_name: 'Kasun Perera',
    attendee_email: 'kasun@example.com',
    attendee_phone: '+94 77 555 4433',
    attendee_nic: '200012345678',
    tier_name: 'vip',
    tier_label: 'VIP Pass',
    quantity: 1,
    unit_price: 15000,
    total_amount: 15000,
    currency: 'LKR',
    payment_method: 'bank_transfer',
    payment_status: 'pending_verification',
    payment_slip_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
    status: 'pending_verification',
    created_at: '2026-07-22T05:30:00+05:30',
  },
];

// ── Mock Attendees ─────────────────────────────────────────────
export const MOCK_ATTENDEES: IAttendee[] = [
  {
    booking_ref: 'IDF-A1B2C3D4',
    name: 'Aarav Sharma',
    email: 'aarav@example.com',
    phone: '+94 77 123 4567',
    nic_number: '199512345678',
    tier_name: 'vip',
    tier_label: 'VIP Pass',
    quantity: 2,
    checked_in: false,
    booking_status: 'confirmed',
    payment_status: 'paid',
    payment_method: 'bank_transfer',
    created_at: '2026-07-10T14:22:00+05:30',
  },
  {
    booking_ref: 'IDF-E5F6G7H8',
    name: 'Priya Nair',
    email: 'priya@example.com',
    phone: '+94 71 987 6543',
    nic_number: '199887654321',
    tier_name: 'standard',
    tier_label: 'Standard',
    quantity: 1,
    checked_in: true,
    checked_in_at: '2026-10-24T19:34:00+05:30',
    booking_status: 'confirmed',
    payment_status: 'paid',
    payment_method: 'payhere',
    created_at: '2026-07-12T09:11:00+05:30',
  },
];

// ── Mock Users ────────────────────────────────────────────────
export const MOCK_USERS: IUser[] = [
  {
    id: 'user_admin',
    name: 'Admin User',
    email: 'admin@ideomint.com',
    role: 'admin',
    created_at: '2026-01-01T00:00:00Z',
  },
];

// ── Helpers ───────────────────────────────────────────────────
export function getEventStats(events: IEvent[]) {
  const totalRevenue = events.reduce((sum, evt) => {
    const tiers = evt.ticket_tiers || [];
    return sum + tiers.reduce((tSum, t) => tSum + (t.price || 0) * (t.sold || 0), 0);
  }, 0);

  const totalTicketsSold = events.reduce((sum, evt) => {
    const tiers = evt.ticket_tiers || [];
    return sum + tiers.reduce((tSum, t) => tSum + (t.sold || 0), 0);
  }, 0);

  const totalCapacity = events.reduce((sum, evt) => {
    const tiers = evt.ticket_tiers || [];
    return sum + tiers.reduce((tSum, t) => tSum + (t.capacity || 0), 0);
  }, 0);

  return { totalRevenue, totalTicketsSold, totalCapacity };
}

declare global {
  var __IDEOFEST_EVENTS_STORE__: IEvent[] | undefined;
}

if (!globalThis.__IDEOFEST_EVENTS_STORE__) {
  globalThis.__IDEOFEST_EVENTS_STORE__ = [];
}

export function addMockEvent(event: IEvent): IEvent {
  const newEvt: IEvent = {
    ...event,
    id: event.id || `evt_${Date.now()}`,
    created_at: event.created_at || new Date().toISOString(),
    ticket_tiers: (event.ticket_tiers || []).map((t, idx) => ({
      ...t,
      id: t.id || `tier_${Date.now()}_${idx}`,
      sold: t.sold || 0,
      currency: t.currency || 'LKR',
    })),
  };

  if (!globalThis.__IDEOFEST_EVENTS_STORE__) {
    globalThis.__IDEOFEST_EVENTS_STORE__ = [];
  }

  const exists = globalThis.__IDEOFEST_EVENTS_STORE__.some((e) => e.slug === newEvt.slug);
  if (!exists) {
    globalThis.__IDEOFEST_EVENTS_STORE__.unshift(newEvt);
  }
  const mockExists = MOCK_EVENTS.some((e) => e.slug === newEvt.slug);
  if (!mockExists) {
    MOCK_EVENTS.unshift(newEvt);
  }
  return newEvt;
}

export function getAllEventsStore(): IEvent[] {
  const customEvents = globalThis.__IDEOFEST_EVENTS_STORE__ || [];
  const slugs = new Set(customEvents.map((e) => e.slug));
  const mocks = MOCK_EVENTS.filter((e) => !slugs.has(e.slug));
  return [...customEvents, ...mocks];
}

export function getMockEventBySlug(slug: string): IEvent | null {
  const all = getAllEventsStore();
  return all.find((e) => e.slug.toLowerCase() === slug.toLowerCase()) || null;
}
