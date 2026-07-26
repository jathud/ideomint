import { clearAdminSession } from '@/lib/ideofest/auth';
import type { ApiResponse } from '@/lib/ideofest/types';

export async function POST() {
  await clearAdminSession();
  return Response.json({ success: true, message: 'Logged out successfully' } satisfies ApiResponse);
}
