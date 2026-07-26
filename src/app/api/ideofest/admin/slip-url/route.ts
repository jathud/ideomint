import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import { isAdminAuthenticated } from '@/lib/ideofest/auth';
import type { ApiResponse } from '@/lib/ideofest/types';

/**
 * GET /api/ideofest/admin/slip-url?path=...
 * Returns accessible URL for payment slip.
 * Admin only.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ success: false, error: 'Unauthorized' } satisfies ApiResponse, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return Response.json({ success: false, error: 'path parameter is required' } satisfies ApiResponse, { status: 400 });
  }

  // If path is already a Cloudinary or HTTP(S) URL, return it directly
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return Response.json({
      success: true,
      data: { url: path },
    } satisfies ApiResponse<{ url: string }>);
  }

  // Fallback to Supabase Storage signed URL if path is a legacy storage path
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from('payment-slips')
      .createSignedUrl(path, 60 * 60);

    if (!error && data?.signedUrl) {
      return Response.json({ success: true, data: { url: data.signedUrl } } satisfies ApiResponse<{ url: string }>);
    }
  } catch (err) {
    console.warn('[slip-url Warning] Supabase storage fallback failed:', err);
  }

  // Return path as fallback
  return Response.json({ success: true, data: { url: path } } satisfies ApiResponse<{ url: string }>);
}
