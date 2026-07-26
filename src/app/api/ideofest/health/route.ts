import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import type { ApiResponse } from '@/lib/ideofest/types';

/**
 * GET /api/ideofest/health
 * Public System Health & Uptime Status Endpoint
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const uptimeSeconds = Math.floor(process.uptime());

  let dbStatus = 'operational';
  let dbLatencyMs = 0;

  try {
    const supabase = createAdminClient();
    const dbStart = Date.now();
    const { error } = await supabase.from('events').select('id', { count: 'exact', head: true });
    dbLatencyMs = Date.now() - dbStart;
    if (error) dbStatus = 'degraded';
  } catch {
    dbStatus = 'offline';
  }

  const cloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);
  const smtpConfigured = !!(process.env.SMTP_HOST || process.env.RESEND_API_KEY);

  const isHealthy = dbStatus !== 'offline';

  const healthData = {
    status: isHealthy ? 'healthy' : 'degraded',
    uptime_seconds: uptimeSeconds,
    uptime_formatted: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
    timestamp: new Date().toISOString(),
    response_time_ms: Date.now() - startTime,
    services: {
      database: { status: dbStatus, latency_ms: dbLatencyMs },
      cloudinary: { status: cloudinaryConfigured ? 'operational' : 'not_configured' },
      email_smtp: { status: smtpConfigured ? 'operational' : 'not_configured' },
    },
  };

  return Response.json({
    success: isHealthy,
    data: healthData,
  } satisfies ApiResponse<typeof healthData>, { status: isHealthy ? 200 : 503 });
}
