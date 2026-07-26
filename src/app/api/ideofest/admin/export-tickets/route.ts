import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import { isAdminAuthenticated } from '@/lib/ideofest/auth';
import type { ApiResponse } from '@/lib/ideofest/types';

/**
 * GET /api/ideofest/admin/export-tickets?event_id=...
 * Exports ticket and booking details for a specific event (or all events) as CSV spreadsheet.
 * Admin only.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ success: false, error: 'Unauthorized: Admin access required' } satisfies ApiResponse, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const event_id = searchParams.get('event_id');
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
      'Ticket Number',
      'Customer Name',
      'Email',
      'Phone',
      'NIC / Passport',
      'Event Title',
      'Event Date',
      'Venue',
      'Ticket Tier',
      'Quantity',
      'Unit Price (LKR)',
      'Total Amount (LKR)',
      'Payment Method',
      'Payment Status',
      'Booking Status',
      'QR Code Token',
      'Created At',
    ];

    const rows: string[] = [headers.join(',')];

    (bookings || []).forEach((b: any) => {
      const ticketList = b.tickets || [];
      const ticketNumber = ticketList.map((t: { ticket_number: string }) => t.ticket_number).join('; ') || 'Pending';
      const qrToken = ticketList.map((t: { qr_token: string }) => t.qr_token).join('; ') || 'N/A';

      const row = [
        escapeCsv(b.booking_ref),
        escapeCsv(ticketNumber),
        escapeCsv(b.attendee_name),
        escapeCsv(b.attendee_email),
        escapeCsv(b.attendee_phone || ''),
        escapeCsv(b.attendee_nic || ''),
        escapeCsv(b.event_title),
        escapeCsv(b.event_date),
        escapeCsv(b.venue),
        escapeCsv(b.tier_label || b.tier_name),
        escapeCsv(b.quantity),
        escapeCsv(b.unit_price),
        escapeCsv(b.total_amount),
        escapeCsv(b.payment_method),
        escapeCsv(b.payment_status),
        escapeCsv(b.status),
        escapeCsv(qrToken),
        escapeCsv(b.created_at),
      ];

      rows.push(row.join(','));
    });

    const csvContent = rows.join('\n');
    const filename = `ideofest-tickets-${eventTitle}-${new Date().toISOString().split('T')[0]}.csv`;

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
