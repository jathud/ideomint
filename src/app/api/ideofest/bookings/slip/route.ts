import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import type { ApiResponse, IBooking } from '@/lib/ideofest/types';

/**
 * PATCH /api/ideofest/bookings/slip
 * Body: { bookingId?: string, booking_ref?: string, slipUrl: string }
 * Attaches a Cloudinary payment slip URL to an existing booking in Supabase
 * and sets status to 'pending_verification'.
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, booking_ref, slipUrl } = body;
    const ref = bookingId || booking_ref;

    if (!ref) {
      return Response.json(
        { success: false, error: 'bookingId or booking_ref is required' } satisfies ApiResponse,
        { status: 400 }
      );
    }
    if (!slipUrl || !/^https:\/\//.test(slipUrl)) {
      return Response.json(
        { success: false, error: 'slipUrl must be a valid HTTPS URL' } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Query booking by ID or booking_ref
    let query = supabase.from('bookings').select('*');
    if (bookingId) {
      query = query.eq('id', bookingId);
    } else {
      query = query.eq('booking_ref', String(booking_ref).toUpperCase());
    }

    const { data: existing, error: findErr } = await query.maybeSingle();

    if (findErr || !existing) {
      return Response.json(
        { success: false, error: 'Booking not found in Supabase' } satisfies ApiResponse,
        { status: 404 }
      );
    }

    if (existing.status === 'confirmed') {
      return Response.json(
        { success: false, error: 'Booking is already confirmed' } satisfies ApiResponse,
        { status: 409 }
      );
    }

    if (existing.status === 'cancelled' || existing.status === 'rejected') {
      return Response.json(
        { success: false, error: `Booking is ${existing.status} and cannot accept a payment slip` } satisfies ApiResponse,
        { status: 409 }
      );
    }

    // Attach slip URL and set to pending_verification for admin review in Supabase
    const { data: updated, error: updateErr } = await supabase
      .from('bookings')
      .update({
        payment_slip_url: slipUrl,
        payment_slip_path: slipUrl,
        payment_status: 'pending_verification',
        status: 'pending_verification',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (updateErr) {
      console.error('[PATCH /api/ideofest/bookings/slip Supabase Update Error]:', updateErr);
      throw new Error(`Failed to update booking in Supabase: ${updateErr.message}`);
    }

    return Response.json({
      success: true,
      message: 'Payment slip uploaded. Your booking is now under review by our team.',
      data: updated as IBooking,
    } satisfies ApiResponse<IBooking>);
  } catch (error: unknown) {
    console.error('[PATCH /api/ideofest/bookings/slip Error]:', error);
    const msg = error instanceof Error ? error.message : 'Failed to attach payment slip';
    return Response.json(
      { success: false, error: msg } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
