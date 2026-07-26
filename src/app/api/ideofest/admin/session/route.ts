import { isAdminAuthenticated } from '@/lib/ideofest/auth';
import type { ApiResponse } from '@/lib/ideofest/types';

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  return Response.json({
    success: true,
    data: { authenticated, role: authenticated ? 'admin' : null },
  } satisfies ApiResponse);
}
