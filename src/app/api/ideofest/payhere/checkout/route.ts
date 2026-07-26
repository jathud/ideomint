import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import { buildPayHereCheckoutPayload, PAYHERE_BASE_URL } from '@/lib/ideofest/payhere';
import type { ApiResponse } from '@/lib/ideofest/types';

/**
 * POST /api/ideofest/payhere/checkout
 * Build PayHere checkout payload for a booking.
 * Called from the booking page when user selects PayHere.
 */
export async function POST(request: NextRequest) {
  try {
    const { booking_id } = await request.json();
    if (!booking_id) {
      return Response.json({ success: false, error: 'booking_id is required' } satisfies ApiResponse, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (error || !booking) {
      return Response.json({ success: false, error: 'Booking not found' } satisfies ApiResponse, { status: 404 });
    }

    const payload = buildPayHereCheckoutPayload(booking);

    return Response.json({
      success: true,
      data: {
        action: PAYHERE_BASE_URL,
        fields: payload,
      },
    } satisfies ApiResponse);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Checkout failed';
    return Response.json({ success: false, error: msg } satisfies ApiResponse, { status: 500 });
  }
}
