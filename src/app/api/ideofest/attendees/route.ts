import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import type { ApiResponse, IAttendee } from '@/lib/ideofest/types';

// ── GET: Attendees list (derived from bookings + multi-attendees) ───────────────
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || searchParams.get('event_id');
    const checkedInParam = searchParams.get('checkedIn') || searchParams.get('checked_in');

    let query = supabase
      .from('bookings')
      .select('*, tickets(status, used_at)')
      .order('created_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data: bookings, error } = await query;
    if (error) throw error;

    const attendees: IAttendee[] = [];

    (bookings || []).forEach((b: any) => {
      const ticket = b.tickets?.[0];
      const isCheckedIn = ticket?.status === 'used' || b.status === 'confirmed';

      // Attendee 1 (Lead Booker)
      attendees.push({
        booking_ref: b.booking_ref,
        name: b.attendee_name,
        email: b.attendee_email,
        phone: b.attendee_phone || '—',
        nic_number: b.attendee_nic || '—',
        tier_name: b.tier_name,
        tier_label: b.tier_label,
        quantity: b.quantity,
        checked_in: isCheckedIn,
        checked_in_at: ticket?.used_at,
        booking_status: b.status,
        payment_status: b.payment_status,
        payment_method: b.payment_method,
        payment_slip_url: b.payment_slip_url,
        created_at: b.created_at,
      });

      // Additional Attendees (Attendee 2, 3, etc.)
      const extras = b.additional_attendees;
      if (Array.isArray(extras) && extras.length > 0) {
        extras.forEach((extra: { name?: string; nic?: string; phone?: string }, idx: number) => {
          if (extra.name || extra.nic || extra.phone) {
            attendees.push({
              booking_ref: `${b.booking_ref}-${idx + 2}`,
              name: extra.name || `Attendee ${idx + 2}`,
              email: b.attendee_email,
              phone: extra.phone || b.attendee_phone || '—',
              nic_number: extra.nic || '—',
              tier_name: b.tier_name,
              tier_label: `${b.tier_label} (Pass ${idx + 2}/${b.quantity})`,
              quantity: 1,
              checked_in: isCheckedIn,
              checked_in_at: ticket?.used_at,
              booking_status: b.status,
              payment_status: b.payment_status,
              payment_method: b.payment_method,
              payment_slip_url: b.payment_slip_url,
              created_at: b.created_at,
            });
          }
        });
      }
    });

    let filteredAttendees = attendees;
    if (checkedInParam === 'true') {
      filteredAttendees = attendees.filter((a) => a.checked_in);
    } else if (checkedInParam === 'false') {
      filteredAttendees = attendees.filter((a) => !a.checked_in);
    }

    return Response.json({ success: true, data: filteredAttendees } satisfies ApiResponse<IAttendee[]>);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch attendees';
    return Response.json({ success: false, error: msg } satisfies ApiResponse, { status: 500 });
  }
}
