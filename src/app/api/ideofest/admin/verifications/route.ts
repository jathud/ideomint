import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import { isAdminAuthenticated } from '@/lib/ideofest/auth';
import type { ApiResponse, IBooking } from '@/lib/ideofest/types';

async function requireAdmin(): Promise<Response | null> {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return Response.json(
      { success: false, error: 'Unauthorized — admin session required' } satisfies ApiResponse,
      { status: 401 }
    );
  }
  return null;
}

export async function GET(request: NextRequest) {
  const unauthed = await requireAdmin();
  if (unauthed) return unauthed;

  const statusParam = request.nextUrl.searchParams.get('status') || 'pending_verification';

  try {
    const supabase = createAdminClient();
    let query = supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusParam !== 'all') {
      query = query.eq('status', statusParam);
    }

    const { data: bookings, error } = await query;
    if (error) throw error;

    return Response.json({ success: true, data: bookings as IBooking[] } satisfies ApiResponse<IBooking[]>);
  } catch (error) {
    console.error('[GET /api/ideofest/admin/verifications]', error);
    return Response.json(
      { success: false, error: 'Failed to fetch verifications' } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const unauthed = await requireAdmin();
  if (unauthed) return unauthed;

  try {
    const { bookingId, booking_ref, action, rejectionReason } = await request.json();
    const targetRef = booking_ref || bookingId;

    if (!targetRef || !['approve', 'reject'].includes(action)) {
      return Response.json(
        { success: false, error: 'booking_ref and valid action (approve/reject) required' } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const isApprove = action === 'approve';
    const updatedStatus = isApprove ? 'confirmed' : 'rejected';
    const updatedPaymentStatus = isApprove ? 'paid' : 'rejected';

    const supabase = createAdminClient();
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        status: updatedStatus,
        payment_status: updatedPaymentStatus,
        paid_at: isApprove ? new Date().toISOString() : null,
        admin_notes: rejectionReason || null,
      })
      .or(`booking_ref.eq.${targetRef},id.eq.${targetRef}`)
      .select()
      .single();

    if (error || !booking) {
      return Response.json(
        { success: false, error: 'Booking record not found' } satisfies ApiResponse,
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: booking,
      message: isApprove
        ? 'Payment slip verified & ticket confirmed!'
        : `Booking rejected: ${rejectionReason || 'Invalid payment slip'}`,
    } satisfies ApiResponse);
  } catch (error) {
    console.error('[PATCH /api/ideofest/admin/verifications]', error);
    return Response.json(
      { success: false, error: 'Failed to process payment slip verification' } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
