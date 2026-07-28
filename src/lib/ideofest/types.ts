// ============================================================
// Ideofest — Shared TypeScript Types (Supabase Edition)
// Currency: LKR (Sri Lankan Rupee)
// ============================================================

export type Role = 'attendee' | 'organizer' | 'admin';

export type EventStatus = 'draft' | 'published' | 'sold_out' | 'cancelled' | 'completed';

export type EventCategory =
  | 'music'
  | 'tech'
  | 'art'
  | 'business'
  | 'food'
  | 'sports'
  | 'wellness'
  | 'community';

export type TicketTierName = 'free' | 'early_bird' | 'standard' | 'vip';

export type PaymentStatus =
  | 'pending'
  | 'pending_verification'
  | 'paid'
  | 'failed'
  | 'rejected'
  | 'refunded'
  | 'cancelled';

export type BookingStatus =
  | 'pending'
  | 'pending_verification'
  | 'confirmed'
  | 'cancelled'
  | 'rejected';

export type PaymentMethod = 'bank_transfer' | 'payhere' | 'free';

export type TicketStatus = 'issued' | 'used' | 'cancelled' | 'expired';

export const DEFAULT_CURRENCY = 'LKR';

// ── Ticket Tier ──────────────────────────────────────────────
export interface ITicketTier {
  id?: string;
  event_id?: string;
  name: TicketTierName;
  label: string;
  price: number;
  currency: string;   // Always 'LKR'
  capacity: number;
  sold: number;
  perks: string[];
  sort_order?: number;
  created_at?: string;
}

// ── Event ────────────────────────────────────────────────────
export interface IEvent {
  id?: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: EventCategory;
  date: string;               // ISO string
  end_date?: string;
  venue: string;
  city: string;
  country: string;
  image_url: string;
  gallery_urls?: string[];
  ticket_tiers?: ITicketTier[];  // joined from ticket_tiers table
  organizer_id: string;
  organizer_name: string;
  status: EventStatus;
  payment_methods: PaymentMethod[];
  // Bank transfer details (optional per-event override)
  bank_name?: string;
  bank_account_name?: string;
  bank_account_no?: string;
  bank_branch?: string;
  tags: string[];
  featured: boolean;
  guest_booking_allowed: boolean;
  created_at?: string;
  updated_at?: string;
}

// ── Customer ─────────────────────────────────────────────────
export interface ICustomer {
  id?: string;
  auth_user_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  nic_number?: string;
  date_of_birth?: string;
  // Address
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  district?: string;
  postal_code?: string;
  country?: string;
  // Emergency
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  // Profile
  company?: string;
  job_title?: string;
  profile_photo_url?: string;
  // Flags
  email_verified?: boolean;
  is_guest?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ── Booking ──────────────────────────────────────────────────
export interface IBooking {
  id?: string;
  booking_ref: string;            // IDF-XXXXXXXX
  event_id: string;
  ticket_tier_id: string;
  customer_id?: string;
  // Snapshots
  event_title: string;
  event_date: string;
  event_slug: string;
  venue: string;
  // Customer info
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;
  attendee_nic?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  district?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  company?: string;
  special_notes?: string;
  additional_attendees?: Array<{ name: string; nic: string; phone: string }>;
  special_event_request?: {
    enabled: boolean;
    type?: string;
    details?: string;
  };
  // Ticket
  tier_name: TicketTierName;
  tier_label: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  currency: string;   // 'LKR'
  // Payment
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  gateway_order_id?: string;
  gateway_payment_id?: string;
  gateway_status_code?: string;
  payment_slip_url?: string;
  admin_notes?: string;
  notes?: string;
  payment_slip_path?: string;
  paid_at?: string;
  // Status
  status: BookingStatus;
  approved_by?: string;
  approved_at?: string;
  // Meta
  ip_address?: string;
  created_at?: string;
  updated_at?: string;
  // Joined
  event?: IEvent;
  customer?: ICustomer;
  tickets?: ITicket[];
}

// ── Ticket ───────────────────────────────────────────────────
export interface ITicket {
  id?: string;
  ticket_number: string;    // IDF-TKT-XXXXXXXX
  booking_id: string;
  customer_id?: string;
  qr_token: string;         // Encrypted + signed
  qr_expires_at: string;
  status: TicketStatus;
  pdf_url?: string;
  pdf_path?: string;
  issued_at?: string;
  used_at?: string;
  cancelled_at?: string;
  created_at?: string;
  // Joined
  booking?: IBooking;
}

// ── Attendee (derived view for admin list) ────────────────────
export interface IAttendee {
  booking_ref: string;
  event_id?: string;
  event_title?: string;
  name: string;
  email: string;
  phone?: string;
  nic_number?: string;
  tier_name: TicketTierName;
  tier_label: string;
  quantity: number;
  total_amount?: number;
  checked_in: boolean;
  checked_in_at?: string;
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_slip_url?: string;
  created_at?: string;
}

// ── Attendance Log ────────────────────────────────────────────
export interface IAttendanceLog {
  id?: string;
  ticket_id: string;
  booking_id: string;
  event_id: string;
  customer_id?: string;
  scanned_at?: string;
  gate?: string;
  scanner_name?: string;
  staff_id?: string;
  ip_address?: string;
  device_type?: string;
  browser?: string;
  result: 'success' | 'duplicate' | 'invalid' | 'expired' | 'not_found';
  notes?: string;
}

// ── Notification ──────────────────────────────────────────────
export interface INotification {
  id?: string;
  customer_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at?: string;
}

// ── User (legacy compatibility) ───────────────────────────────
export interface IUser {
  id?: string;
  name: string;
  email: string;
  role: Role;
  avatar_url?: string;
  created_at?: string;
}

// ── API Response wrapper ──────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  result?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// ── Analytics ────────────────────────────────────────────────
export interface IEventAnalytics {
  event_id: string;
  total_revenue: number;
  total_tickets_sold: number;
  total_capacity: number;
  check_in_rate: number;          // 0–1
  tickets_by_tier: Record<TicketTierName, number>;
  revenue_by_day: { date: string; revenue: number }[];
  payment_method_breakdown: Record<PaymentMethod, number>;
  recent_bookings: IBooking[];
  pending_verifications: number;
}

// ── PayHere ───────────────────────────────────────────────────
export interface IPayHereCheckout {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string;
  currency: string;   // 'LKR'
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash: string;
}

// ── Bank Transfer Info ────────────────────────────────────────
export interface IBankTransferInfo {
  bank_name: string;
  account_name: string;
  account_no: string;
  branch: string;
  reference: string;  // booking_ref
  amount: number;
  currency: string;   // 'LKR'
}
