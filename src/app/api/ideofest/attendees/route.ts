import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import type { ApiResponse, IAttendee } from '@/lib/ideofest/types';

// ── GET: Attendees list (derived from bookings) ───────────────
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

    let attendees: IAttendee[] = (bookings || []).map((b: any) => {
      const ticket = b.tickets?.[0];
      const isCheckedIn = ticket?.status === 'used' || b.status === 'confirmed';
      return {
        booking_ref: b.booking_ref,
        name: b.attendee_name,
        email: b.attendee_email,
        phone: b.attendee_phone,
        nic_number: b.attendee_nic,
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
      };
    });

    if (checkedInParam === 'true') {
      attendees = attendees.filter((a) => a.checked_in);
    } else if (checkedInParam === 'false') {
      attendees = attendees.filter((a) => !a.checked_in);
    }

    return Response.json({ success: true, data: attendees } satisfies ApiResponse<IAttendee[]>);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch attendees';
    return Response.json({ success: false, error: msg } satisfies ApiResponse, { status: 500 });
  }
}
