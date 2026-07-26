import { type NextRequest } from 'next/server';
import { verifyAdminCredentials, setAdminSession } from '@/lib/ideofest/auth';
import type { ApiResponse } from '@/lib/ideofest/types';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { success: false, error: 'Email and password are required' } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const isValid = await verifyAdminCredentials(email, password);

    if (!isValid) {
      return Response.json(
        { success: false, error: 'Invalid admin credentials' } satisfies ApiResponse,
        { status: 401 }
      );
    }

    await setAdminSession(email);

    return Response.json({
      success: true,
      message: 'Admin authentication successful',
      data: { email, role: 'admin' },
    } satisfies ApiResponse);
  } catch (error) {
    console.error('[POST /api/ideofest/admin/login]', error);
    return Response.json(
      { success: false, error: 'Authentication failed' } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
