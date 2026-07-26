import { type NextRequest } from 'next/server';
import { connectDB } from '@/lib/ideofest/db';
import { Event } from '@/lib/ideofest/models/Event';
import { MOCK_EVENTS } from '@/lib/ideofest/mock-data';
import type { ApiResponse, IEvent } from '@/lib/ideofest/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    let event: IEvent | undefined;
    try {
      await connectDB();
      const doc = await Event.findOne({ slug }).lean();
      event = doc as unknown as IEvent;
    } catch {
      event = MOCK_EVENTS.find((e) => e.slug === slug);
    }

    if (!event) {
      return Response.json({ success: false, error: 'Event not found' } satisfies ApiResponse, { status: 404 });
    }

    return Response.json({ success: true, data: event } satisfies ApiResponse<IEvent>);
  } catch (error) {
    console.error('[GET /api/ideofest/events/[slug]]', error);
    return Response.json({ success: false, error: 'Failed to fetch event' } satisfies ApiResponse, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const body = await request.json();
    await connectDB();
    const updated = await Event.findOneAndUpdate({ slug }, body, { new: true, lean: true });
    if (!updated) {
      return Response.json({ success: false, error: 'Event not found' } satisfies ApiResponse, { status: 404 });
    }
    return Response.json({ success: true, data: updated, message: 'Event updated' } satisfies ApiResponse);
  } catch (error) {
    console.error('[PATCH /api/ideofest/events/[slug]]', error);
    return Response.json({ success: false, error: 'Failed to update event' } satisfies ApiResponse, { status: 500 });
  }
}
