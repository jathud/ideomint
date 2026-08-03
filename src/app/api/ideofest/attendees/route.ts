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
        booking_id: b.id,
        ticket_id: ticket?.id,
        booking_ref: b.booking_ref,
        event_id: b.event_id,
        event_title: b.event_title,
        name: b.attendee_name,
        email: b.attendee_email,
        phone: b.attendee_phone || '—',
        nic_number: b.attendee_nic || '—',
        tier_name: b.tier_name,
        tier_label: b.tier_label,
        quantity: b.quantity,
        total_amount: b.total_amount || 0,
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
              booking_id: b.id,
              ticket_id: ticket?.id,
              booking_ref: `${b.booking_ref}-${idx + 2}`,
              event_id: b.event_id,
              event_title: b.event_title,
              name: extra.name || `Attendee ${idx + 2}`,
              email: b.attendee_email,
              phone: extra.phone || b.attendee_phone || '—',
              nic_number: extra.nic || '—',
              tier_name: b.tier_name,
              tier_label: `${b.tier_label} (Pass ${idx + 2}/${b.quantity})`,
              quantity: 1,
              total_amount: 0,
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

// ── DELETE: Delete ticket / booking & associated attendee entries ────────────────
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const bookingIdParam = searchParams.get('booking_id') || searchParams.get('bookingId') || searchParams.get('id');
    const bookingRefParam = searchParams.get('booking_ref') || searchParams.get('bookingRef');
    const attendeeIdParam = searchParams.get('attendee_id') || searchParams.get('attendeeId');

    let targetBookingId: string | null = null;

    // 1. Try resolving booking_id directly from bookings table
    if (bookingIdParam) {
      const { data: b } = await supabase.from('bookings').select('id').eq('id', bookingIdParam).maybeSingle();
      if (b?.id) {
        targetBookingId = b.id;
      }
    }

    // 2. Try resolving via attendee_id or if bookingIdParam was actually an attendee ID
    if (!targetBookingId) {
      const idToSearch = attendeeIdParam || bookingIdParam;
      if (idToSearch) {
        const { data: att } = await supabase.from('attendees').select('booking_id').eq('id', idToSearch).maybeSingle();
        if (att?.booking_id) {
          targetBookingId = att.booking_id;
        }
      }
    }

    // 3. Try resolving via booking_ref
    if (!targetBookingId && bookingRefParam) {
      const { data: bExact } = await supabase.from('bookings').select('id').eq('booking_ref', bookingRefParam).maybeSingle();
      if (bExact?.id) {
        targetBookingId = bExact.id;
      } else {
        const baseRef = bookingRefParam.replace(/-\d+$/, '');
        const { data: bBase } = await supabase.from('bookings').select('id').eq('booking_ref', baseRef).maybeSingle();
        if (bBase?.id) {
          targetBookingId = bBase.id;
        } else {
          const { data: bList } = await supabase.from('bookings').select('id').ilike('booking_ref', `${baseRef}%`).limit(1);
          if (bList && bList.length > 0) {
            targetBookingId = bList[0].id;
          }
        }
      }
    }

    if (!targetBookingId) {
      return Response.json({ success: false, error: 'Target booking record not found' } satisfies ApiResponse, { status: 404 });
    }

    // 1. Delete associated attendance logs
    await supabase.from('attendance_logs').delete().eq('booking_id', targetBookingId);

    // 2. Delete associated tickets
    await supabase.from('tickets').delete().eq('booking_id', targetBookingId);

    // 3. Delete associated attendees
    await supabase.from('attendees').delete().eq('booking_id', targetBookingId);

    // 4. Delete the main booking row
    const { error: delErr } = await supabase.from('bookings').delete().eq('id', targetBookingId);

    if (delErr) {
      throw new Error(delErr.message);
    }

    return Response.json({
      success: true,
      message: 'Booking, tickets, and attendee details deleted successfully',
    } satisfies ApiResponse);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete ticket / attendee';
    return Response.json({ success: false, error: msg } satisfies ApiResponse, { status: 500 });
  }
}
