import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import { isAdminAuthenticated } from '@/lib/ideofest/auth';
import type { ApiResponse } from '@/lib/ideofest/types';

/**
 * GET /api/ideofest/admin/export-tickets?event_id=...&status=...
 * Exports ticket and booking details for a specific event (or all events) as CSV spreadsheet.
 * Expands multi-ticket bookings (e.g. 3 tickets) so each attendee gets an explicit row in the report.
 * Admin only.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ success: false, error: 'Unauthorized: Admin access required' } satisfies ApiResponse, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const event_id = searchParams.get('event_id');
    const filterStatus = searchParams.get('status') || searchParams.get('payment_status') || 'all';
    const format = searchParams.get('format') || 'csv';

    const supabase = createAdminClient();

    let eventTitle = 'All-Events';
    if (event_id) {
      const { data: evt } = await supabase.from('events').select('title, slug').eq('id', event_id).maybeSingle();
      if (evt?.slug) eventTitle = evt.slug;
    }

    let query = supabase
      .from('bookings')
      .select('*, tickets(*)')
      .order('created_at', { ascending: false });

    if (event_id) {
      query = query.eq('event_id', event_id);
    }

    if (filterStatus === 'confirmed' || filterStatus === 'paid') {
      query = query.or('status.eq.confirmed,payment_status.eq.paid,payment_status.eq.confirmed');
    } else if (filterStatus === 'pending_verification' || filterStatus === 'pending') {
      query = query.or('status.eq.pending_verification,payment_status.eq.pending_verification');
    }

    const { data: bookings, error } = await query;
    if (error) throw error;

    if (format === 'json') {
      return Response.json({ success: true, data: bookings } satisfies ApiResponse);
    }

    // Helper to sanitize CSV field
    const escapeCsv = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    // CSV Headers
    const headers = [
      'Booking Ref',
      'Pass Index',
      'Attendee Name',
      'Email Address',
      'Phone Number',
      'NIC / Passport',
      'Event Title',
      'Event Date',
      'Venue',
      'Ticket Tier',
      'Group Quantity',
      'Unit Price (LKR)',
      'Total Amount (LKR)',
      'Payment Method',
      'Payment Status',
      'Booking Status',
      'Emergency Contact Name',
      'Emergency Contact Phone',
      'City / District',
      'Postal Code',
      'Payment Slip URL',
      'Ticket Number',
      'QR Token',
      'Created At',
    ];

    const rows: string[] = [headers.join(',')];

    (bookings || []).forEach((b: any) => {
      const ticketList = b.tickets || [];
      const qty = Math.max(1, b.quantity || 1);
      const extras: Array<{ name?: string; nic?: string; phone?: string }> = Array.isArray(b.additional_attendees) ? b.additional_attendees : [];

      // Row for Attendee 1 (Lead Booker)
      const leadTicketNum = ticketList[0]?.ticket_number || ticketList.map((t: any) => t.ticket_number).join('; ') || 'Pending';
      const leadQrToken = ticketList[0]?.qr_token || ticketList.map((t: any) => t.qr_token).join('; ') || 'N/A';

      const leadRow = [
        escapeCsv(b.booking_ref),
        escapeCsv(`1 of ${qty} (Lead Booker)`),
        escapeCsv(b.attendee_name),
        escapeCsv(b.attendee_email),
        escapeCsv(b.attendee_phone || ''),
        escapeCsv(b.attendee_nic || ''),
        escapeCsv(b.event_title),
        escapeCsv(b.event_date || ''),
        escapeCsv(b.venue || ''),
        escapeCsv(b.tier_label || b.tier_name || 'Standard'),
        escapeCsv(qty),
        escapeCsv(b.unit_price || 0),
        escapeCsv(b.total_amount || 0),
        escapeCsv(b.payment_method || 'bank_transfer'),
        escapeCsv(b.payment_status || 'pending_verification'),
        escapeCsv(b.status || 'pending_verification'),
        escapeCsv(b.emergency_contact_name || ''),
        escapeCsv(b.emergency_contact_phone || ''),
        escapeCsv([b.city, b.district].filter(Boolean).join(', ')),
        escapeCsv(b.postal_code || ''),
        escapeCsv(b.payment_slip_url || ''),
        escapeCsv(leadTicketNum),
        escapeCsv(leadQrToken),
        escapeCsv(b.created_at || ''),
      ];

      rows.push(leadRow.join(','));

      // Rows for Additional Attendees (Attendee 2, Attendee 3, etc.)
      for (let i = 1; i < qty; i++) {
        const extra = extras[i - 1] || {};
        const attendeeName = extra.name || `Attendee ${i + 1} (${b.attendee_name}'s Group)`;
        const attendeeNic = extra.nic || '—';
        const attendeePhone = extra.phone || b.attendee_phone || '—';

        const extraTicketNum = ticketList[i]?.ticket_number || 'Pending';
        const extraQrToken = ticketList[i]?.qr_token || 'N/A';

        const extraRow = [
          escapeCsv(`${b.booking_ref}-${i + 1}`),
          escapeCsv(`${i + 1} of ${qty}`),
          escapeCsv(attendeeName),
          escapeCsv(b.attendee_email),
          escapeCsv(attendeePhone),
          escapeCsv(attendeeNic),
          escapeCsv(b.event_title),
          escapeCsv(b.event_date || ''),
          escapeCsv(b.venue || ''),
          escapeCsv(b.tier_label || b.tier_name || 'Standard'),
          escapeCsv(1),
          escapeCsv(0),
          escapeCsv(0),
          escapeCsv(b.payment_method || 'bank_transfer'),
          escapeCsv(b.payment_status || 'pending_verification'),
          escapeCsv(b.status || 'pending_verification'),
          escapeCsv(b.emergency_contact_name || ''),
          escapeCsv(b.emergency_contact_phone || ''),
          escapeCsv([b.city, b.district].filter(Boolean).join(', ')),
          escapeCsv(b.postal_code || ''),
          escapeCsv(b.payment_slip_url || ''),
          escapeCsv(extraTicketNum),
          escapeCsv(extraQrToken),
          escapeCsv(b.created_at || ''),
        ];

        rows.push(extraRow.join(','));
      }
    });

    const csvContent = rows.join('\n');
    const statusLabel = filterStatus !== 'all' ? `-${filterStatus}` : '';
    const filename = `ideofest-report-${eventTitle}${statusLabel}-${new Date().toISOString().split('T')[0]}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Export failed';
    return Response.json({ success: false, error: msg } satisfies ApiResponse, { status: 500 });
  }
}
