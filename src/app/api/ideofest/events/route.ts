import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import { uploadToCloudinary } from '@/lib/ideofest/cloudinary';
import { isAdminAuthenticated } from '@/lib/ideofest/auth';
import type { ApiResponse, IEvent } from '@/lib/ideofest/types';

// ── GET: List/filter events ─────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const slug = searchParams.get('slug');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('events')
      .select('*, ticket_tiers(*)', { count: 'exact' })
      .order('date', { ascending: true })
      .range(from, to);

    if (slug) {
      query = query.eq('slug', slug);
    } else {
      if (status && status !== 'all') query = query.eq('status', status);
      if (category) query = query.eq('category', category);
      if (featured === 'true') query = query.eq('featured', true);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    if (slug && data) {
      const event = data[0] ?? null;
      return Response.json({ success: true, data: event } satisfies ApiResponse<IEvent | null>);
    }

    return Response.json({
      success: true,
      data: data as IEvent[],
      meta: { total: count ?? 0, page, limit },
    } satisfies ApiResponse<IEvent[]>);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : typeof err === 'object' && err !== null && 'message' in err ? String((err as any).message) : 'Failed to fetch events from database';
    return Response.json({ success: false, error: msg } satisfies ApiResponse, { status: 500 });
  }
}

// ── POST: Create event ──────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    let body: Record<string, any> = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const dataStr = formData.get('data') as string;
      if (dataStr) {
        try {
          body = JSON.parse(dataStr);
        } catch {
          body = {};
        }
      }
      const imageFile = formData.get('image') as File | null;
      if (imageFile && !body.image_url && !body.imageUrl) {
        try {
          const buffer = Buffer.from(await imageFile.arrayBuffer());
          const { url } = await uploadToCloudinary(buffer, 'ideofest/events');
          body.image_url = url;
          console.log(`[Events POST] Inline image uploaded to Cloudinary: ${url}`);
        } catch (imgErr) {
          console.warn('[Events POST] Inline image upload error:', imgErr);
        }
      }
    } else {
      body = await request.json();
    }

    const slug = body.slug;
    const title = body.title;
    const tagline = body.tagline || '';
    const description = body.description;
    const category = body.category;
    const date = body.date;
    const end_date = body.end_date || body.endDate || null;
    const venue = body.venue;
    const city = body.city;
    const country = body.country || 'Sri Lanka';
    const image_url = body.image_url || body.imageUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=1200';
    const gallery_urls = body.gallery_urls || body.galleryUrls || [];
    const organizer_id = body.organizer_id || body.organizerId || 'admin';
    const organizer_name = body.organizer_name || body.organizerName || 'Ideomint';
    const status = body.status || 'published';
    const payment_methods = body.payment_methods || body.paymentMethods || ['bank_transfer'];
    const bank_name = body.bank_name || body.bankName || process.env.BANK_NAME || '';
    const bank_account_name = body.bank_account_name || body.bankAccountName || process.env.BANK_ACCOUNT_NAME || '';
    const bank_account_no = body.bank_account_no || body.bankAccountNo || process.env.BANK_ACCOUNT_NO || '';
    const bank_branch = body.bank_branch || body.bankBranch || process.env.BANK_BRANCH || '';
    const tags = body.tags || [];
    const featured = body.featured ?? false;
    const guest_booking_allowed = body.guest_booking_allowed ?? body.guestBookingAllowed ?? true;
    const ticket_tiers = body.ticket_tiers || body.ticketTiers || [];

    // Validation
    if (!slug || !title || !description || !category || !date || !venue || !city) {
      return Response.json(
        { success: false, error: 'Missing required fields (title, description, category, date, venue, city)' } satisfies ApiResponse,
        { status: 400 }
      );
    }
    if (!Array.isArray(ticket_tiers) || ticket_tiers.length === 0) {
      return Response.json(
        { success: false, error: 'At least one ticket tier is required' } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const cleanSlug = String(slug).toLowerCase().trim();
    const supabase = createAdminClient();

    // Insert event into Supabase
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        slug: cleanSlug,
        title: String(title).trim(),
        tagline,
        description,
        category,
        date,
        end_date,
        venue,
        city,
        country,
        image_url,
        gallery_urls,
        organizer_id,
        organizer_name,
        status,
        payment_methods,
        bank_name,
        bank_account_name,
        bank_account_no,
        bank_branch,
        tags,
        featured,
        guest_booking_allowed,
      })
      .select()
      .single();

    if (eventError) {
      if (eventError.code === '23505') {
        return Response.json(
          { success: false, error: 'An event with this slug already exists in Supabase' } satisfies ApiResponse,
          { status: 409 }
        );
      }
      console.error('[Supabase Event Insert Error]:', eventError);
      return Response.json(
        { success: false, error: `Supabase Insert Failed: ${eventError.message}` } satisfies ApiResponse,
        { status: 500 }
      );
    }

    // Insert ticket tiers into Supabase
    const tiersToInsert = ticket_tiers.map((tier: Record<string, unknown>, i: number) => ({
      event_id: event.id,
      name: tier.name || 'standard',
      label: tier.label || 'Standard',
      price: Number(tier.price) || 0,
      currency: 'LKR',
      capacity: Number(tier.capacity) || 100,
      sold: 0,
      perks: Array.isArray(tier.perks) ? tier.perks : typeof tier.perks === 'string' ? (tier.perks as string).split('\n').filter(Boolean) : [],
      sort_order: i,
    }));

    const { error: tiersError } = await supabase.from('ticket_tiers').insert(tiersToInsert);
    if (tiersError) {
      console.error('[Supabase Ticket Tiers Insert Error]:', tiersError);
      return Response.json(
        { success: false, error: `Supabase Ticket Tiers Insert Failed: ${tiersError.message}` } satisfies ApiResponse,
        { status: 500 }
      );
    }

    // Fetch complete inserted event with ticket tiers
    const { data: fullEvent, error: fetchError } = await supabase
      .from('events')
      .select('*, ticket_tiers(*)')
      .eq('id', event.id)
      .single();

    if (fetchError || !fullEvent) {
      throw fetchError || new Error('Failed to fetch newly inserted event from Supabase');
    }

    return Response.json(
      { success: true, data: fullEvent, message: 'Event created and stored in Supabase successfully' } satisfies ApiResponse<IEvent>,
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('[Events POST Error]:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ success: false, error: msg } satisfies ApiResponse, { status: 500 });
  }
}

// ── PATCH: Update event details / status (Admin Only) ───────
export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ success: false, error: 'Unauthorized: Admin access required' } satisfies ApiResponse, { status: 401 });
  }
  try {
    const body = await request.json();
    const {
      id, status, title, tagline, description, category, date, venue, city, featured,
      image_url, payment_methods, bank_name, bank_account_name, bank_account_no, bank_branch,
    } = body;

    if (!id) {
      return Response.json({ success: false, error: 'Event id is required' } satisfies ApiResponse, { status: 400 });
    }

    const supabase = createAdminClient();
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };

    if (status) updateData.status = status;
    if (title) updateData.title = title;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (date) updateData.date = date;
    if (venue) updateData.venue = venue;
    if (city) updateData.city = city;
    if (featured !== undefined) updateData.featured = featured;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (Array.isArray(payment_methods)) updateData.payment_methods = payment_methods;
    if (bank_name !== undefined) updateData.bank_name = bank_name;
    if (bank_account_name !== undefined) updateData.bank_account_name = bank_account_name;
    if (bank_account_no !== undefined) updateData.bank_account_no = bank_account_no;
    if (bank_branch !== undefined) updateData.bank_branch = bank_branch;

    const { data: updated, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select('*, ticket_tiers(*)')
      .single();

    if (error) {
      console.error('[Events PATCH Error]:', error);
      return Response.json({ success: false, error: error.message } satisfies ApiResponse, { status: 500 });
    }

    return Response.json({
      success: true,
      data: updated,
      message: 'Event updated successfully in Supabase',
    } satisfies ApiResponse);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Update failed';
    return Response.json({ success: false, error: msg } satisfies ApiResponse, { status: 500 });
  }
}

// ── DELETE: Delete event (Admin Only) ────────────────────────
export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ success: false, error: 'Unauthorized: Admin access required' } satisfies ApiResponse, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return Response.json({ success: false, error: 'Event id is required' } satisfies ApiResponse, { status: 400 });
    }

    const supabase = createAdminClient();

    // Delete ticket_tiers first, then event
    await supabase.from('ticket_tiers').delete().eq('event_id', id);
    const { error } = await supabase.from('events').delete().eq('id', id);

    if (error) {
      console.error('[Events DELETE Error]:', error);
      return Response.json({ success: false, error: error.message } satisfies ApiResponse, { status: 500 });
    }

    return Response.json({
      success: true,
      message: 'Event deleted successfully from Supabase',
    } satisfies ApiResponse);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Delete failed';
    return Response.json({ success: false, error: msg } satisfies ApiResponse, { status: 500 });
  }
}
