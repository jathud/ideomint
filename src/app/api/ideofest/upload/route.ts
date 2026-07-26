import { type NextRequest } from 'next/server';
import { uploadToCloudinary } from '@/lib/ideofest/cloudinary';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import type { ApiResponse } from '@/lib/ideofest/types';

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

/**
 * POST /api/ideofest/upload
 * Accepts: multipart/form-data
 * Fields:
 *   - file: the file to upload (Event Banner / Payment Slip / Profile)
 *   - type: 'payment_slip' | 'event_image' | 'profile_photo'
 *   - booking_ref / bookingRef (for payment_slip uploads)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'payment_slip';
    const bookingRef = (formData.get('booking_ref') as string) || (formData.get('bookingRef') as string) || '';

    if (!file) {
      return Response.json({ success: false, error: 'No file provided' } satisfies ApiResponse, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return Response.json({ success: false, error: `File too large. Maximum size is ${MAX_SIZE_MB}MB` } satisfies ApiResponse, { status: 413 });
    }
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return Response.json({ success: false, error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF, PDF' } satisfies ApiResponse, { status: 415 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine Cloudinary folder based on upload type
    let folder = 'ideofest/events';
    if (type === 'payment_slip') {
      folder = 'ideofest/slips';
    } else if (type === 'profile_photo') {
      folder = 'ideofest/profiles';
    }

    // Upload to Cloudinary
    console.log(`[Upload API] Uploading ${file.name} (${file.size} bytes) to Cloudinary folder "${folder}"...`);
    const { url, publicId } = await uploadToCloudinary(buffer, folder);
    console.log(`[Upload API] Cloudinary upload successful: ${url}`);

    // If this is a payment slip, update the booking in Supabase
    if (type === 'payment_slip' && bookingRef) {
      const cleanRef = bookingRef.trim().toUpperCase();
      try {
        const supabase = createAdminClient();
        const { error: updateError } = await supabase
          .from('bookings')
          .update({
            payment_slip_url: url,
            payment_slip_path: url,
            payment_method: 'bank_transfer',
            payment_status: 'pending_verification',
            status: 'pending_verification',
            updated_at: new Date().toISOString(),
          })
          .ilike('booking_ref', cleanRef);

        if (updateError) {
          console.warn(`[Upload API] Warning: Failed to update booking ${cleanRef} in Supabase:`, updateError.message);
        } else {
          console.log(`[Upload API] Booking ${cleanRef} updated with payment slip URL in Supabase.`);
        }
      } catch (sbErr) {
        console.warn(`[Upload API] Supabase booking update exception:`, sbErr);
      }
    }

    return Response.json({
      success: true,
      data: {
        url,
        publicUrl: url,
        path: url,
        publicId,
        size: file.size,
        type: file.type,
      },
      message: 'File uploaded to Cloudinary successfully',
    } satisfies ApiResponse);
  } catch (err: unknown) {
    console.error('[Upload API Error]:', err);
    const msg = err instanceof Error ? err.message : 'Cloudinary upload failed';
    return Response.json({ success: false, error: msg } satisfies ApiResponse, { status: 500 });
  }
}
