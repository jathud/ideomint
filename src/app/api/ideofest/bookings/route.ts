import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import { generateSecureQRToken, qrExpiryFromEventDate } from '@/lib/ideofest/qr-security';
import { sendBookingConfirmationEmail, sendPaymentApprovedEmail } from '@/lib/ideofest/email';
import type { ApiResponse, IBooking, ITicket } from '@/lib/ideofest/types';

// ── Helpers ──────────────────────────────────────────────────
function normalisePhone(raw: string): string {
  return raw.replace(/[\s\-().]/g, '');
}

// ── POST: Create Booking ─────────────────────────────────────
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();

  // Guard: reject oversized payloads (32KB max) to prevent memory exhaustion
  const contentLength = Number(request.headers.get('content-length') || '0');
  if (contentLength > 32 * 1024) {
    return Response.json(
      { success: false, error: 'Request payload too large (max 32KB)' },
      { status: 413 }
    );
  }

  try {
    const body = await request.json();
    const {
      event_id, event_slug,
      ticket_tier_id,
      payment_method,
      // Attendee info
      attendee_name, attendee_email, attendee_phone, attendee_nic,
      address_line_1, address_line_2, city, district, postal_code, country,
      emergency_contact_name, emergency_contact_phone,
      company, job_title, special_notes,
      quantity,
      additional_attendees,
      special_event_request,
    } = body;

    const finalEmergencyName = emergency_contact_name?.trim() || attendee_name?.trim() || 'Self';
    const finalEmergencyPhone = emergency_contact_phone?.trim() || attendee_phone?.trim() || 'N/A';

    // Combine special notes with special event request (Cake Cutting, Birthday Surprise, etc.) for admin visibility
    let combinedNotes = special_notes || '';
    if (special_event_request?.enabled) {
      const celebrationStr = `[🎉 SPECIAL EVENT CELEBRATION REQUEST]\nType: ${special_event_request.type || 'Custom Request'}\nDetails: ${special_event_request.details || 'None provided'}\n(NOTE: Team will contact customer directly)`;
      combinedNotes = combinedNotes ? `${combinedNotes}\n\n${celebrationStr}` : celebrationStr;
    }

    if (Array.isArray(additional_attendees) && additional_attendees.length > 0) {
      const extraAttendeesStr = `[👥 ADDITIONAL ATTENDEES (${additional_attendees.length})]\n` +
        additional_attendees.map((a: { name?: string; nic?: string; phone?: string }, i: number) =>
          `Attendee ${i + 2}: ${a.name || 'N/A'} | NIC: ${a.nic || 'N/A'} | Phone: ${a.phone || 'N/A'}`
        ).join('\n');
      combinedNotes = combinedNotes ? `${combinedNotes}\n\n${extraAttendeesStr}` : extraAttendeesStr;
    }

    // ── Validation ────────────────────────────────────────────
    if (!event_id && !event_slug) {
      return Response.json({ success: false, error: 'event_id or event_slug is required' } satisfies ApiResponse, { status: 400 });
    }
    if (!ticket_tier_id) {
      return Response.json({ success: false, error: 'ticket_tier_id is required' } satisfies ApiResponse, { status: 400 });
    }
    if (!payment_method || !['bank_transfer', 'payhere', 'free'].includes(payment_method)) {
      return Response.json({ success: false, error: 'Valid payment_method is required (bank_transfer, payhere, free)' } satisfies ApiResponse, { status: 400 });
    }
    if (!attendee_name?.trim()) {
      return Response.json({ success: false, error: 'attendee_name is required' } satisfies ApiResponse, { status: 400 });
    }
    if (!attendee_email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return Response.json({ success: false, error: 'Valid attendee_email is required' } satisfies ApiResponse, { status: 400 });
    }
    if (!attendee_nic?.trim()) {
      return Response.json({ success: false, error: 'NIC number is required' } satisfies ApiResponse, { status: 400 });
    }
    if (!address_line_1?.trim() || !city?.trim() || !district?.trim()) {
      return Response.json({ success: false, error: 'Address (line 1, city, district) is required' } satisfies ApiResponse, { status: 400 });
    }
    const qty = Number(quantity) || 1;
    if (qty < 1 || qty > 10) {
      return Response.json({ success: false, error: 'quantity must be 1–10' } satisfies ApiResponse, { status: 400 });
    }
    if (attendee_phone && !/^\+?[\d]{7,15}$/.test(normalisePhone(attendee_phone))) {
      return Response.json({ success: false, error: 'Invalid phone number format' } satisfies ApiResponse, { status: 400 });
    }

    // ── Fetch Event ───────────────────────────────────────────
    let eventQuery = supabase.from('events').select('*, ticket_tiers(*)');
    if (event_id) eventQuery = eventQuery.eq('id', event_id);
    else eventQuery = eventQuery.eq('slug', event_slug);
    const { data: event, error: eventError } = await eventQuery.single();

    if (eventError || !event) {
      return Response.json({ success: false, error: 'Event not found' } satisfies ApiResponse, { status: 404 });
    }
    if (event.status !== 'published') {
      return Response.json({ success: false, error: 'Event is not available for booking' } satisfies ApiResponse, { status: 400 });
    }

    // ── Fetch Tier ────────────────────────────────────────────
    const tier = event.ticket_tiers?.find((t: { id: string }) => t.id === ticket_tier_id);
    if (!tier) {
      return Response.json({ success: false, error: 'Ticket tier not found' } satisfies ApiResponse, { status: 404 });
    }
    if (tier.sold + qty > tier.capacity) {
      return Response.json({ success: false, error: 'Not enough tickets available' } satisfies ApiResponse, { status: 409 });
    }

    // ── Validate payment method is enabled for event ──────────
    if (!event.payment_methods?.includes(payment_method)) {
      return Response.json({ success: false, error: `Payment method '${payment_method}' is not available for this event` } satisfies ApiResponse, { status: 400 });
    }

    // ── Calculate Totals ──────────────────────────────────────
    const unitPrice = tier.price;
    const totalAmount = unitPrice * qty;
    const isFree = unitPrice === 0 || payment_method === 'free';

    // ── Find/Create Customer ──────────────────────────────────
    let customerId: string | null = null;
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', attendee_email.toLowerCase())
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      // Create guest customer
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({
          full_name: attendee_name.trim(),
          email: attendee_email.toLowerCase(),
          phone: attendee_phone ? normalisePhone(attendee_phone) : null,
          nic_number: attendee_nic?.trim(),
          address_line_1, address_line_2,
          city, district, postal_code,
          country: country || 'Sri Lanka',
          emergency_contact_name: finalEmergencyName,
          emergency_contact_phone: finalEmergencyPhone,
          company, job_title,
          is_guest: true,
        })
        .select('id')
        .single();
      customerId = newCustomer?.id ?? null;
    }

    // ── Create Booking ────────────────────────────────────────
    const initialStatus = isFree ? 'confirmed' : 'pending_verification';
    const initialPaymentStatus = isFree ? 'paid' : 'pending_verification';

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        event_id: event.id,
        ticket_tier_id: tier.id,
        customer_id: customerId,
        // Snapshots
        event_title: event.title,
        event_date: event.date,
        event_slug: event.slug,
        venue: event.venue,
        // Attendee
        attendee_name: attendee_name.trim(),
        attendee_email: attendee_email.toLowerCase(),
        attendee_phone: attendee_phone ? normalisePhone(attendee_phone) : null,
        attendee_nic: attendee_nic?.trim(),
        address_line_1, address_line_2,
        city, district, postal_code,
        country: country || 'Sri Lanka',
        emergency_contact_name: finalEmergencyName,
        emergency_contact_phone: finalEmergencyPhone,
        company, job_title, special_notes: combinedNotes,
        additional_attendees: additional_attendees || [],
        // Ticket
        tier_name: tier.name,
        tier_label: tier.label,
        quantity: qty,
        unit_price: unitPrice,
        total_amount: totalAmount,
        currency: 'LKR',
        // Payment
        payment_method,
        payment_status: initialPaymentStatus,
        paid_at: isFree ? new Date().toISOString() : null,
        // Status
        status: initialStatus,
        // Meta
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // ── For free tickets: issue individual ticket passes & attendee records ──
    if (isFree && booking) {
      const expiresAt = qrExpiryFromEventDate(event.date);
      const extras = Array.isArray(additional_attendees) ? additional_attendees : [];

      for (let i = 0; i < qty; i++) {
        const passIndex = i + 1;
        const attendeeName = i === 0 ? attendee_name.trim() : (extras[i - 1]?.name || `Attendee ${passIndex}`);
        const attendeeNic = i === 0 ? attendee_nic?.trim() : (extras[i - 1]?.nic || attendee_nic?.trim());
        const attendeePhone = i === 0 ? normalisePhone(attendee_phone) : (extras[i - 1]?.phone || normalisePhone(attendee_phone));

        const tempToken = generateSecureQRToken(`TEMP-${booking.booking_ref}-${passIndex}`, event.slug, expiresAt);

        const { data: ticket } = await supabase
          .from('tickets')
          .insert({
            booking_id: booking.id,
            customer_id: customerId,
            qr_token: tempToken,
            qr_expires_at: expiresAt.toISOString(),
            status: 'issued',
            attendee_name: attendeeName,
            attendee_nic: attendeeNic,
            attendee_phone: attendeePhone,
            pass_index: passIndex,
          })
          .select()
          .single();

        if (ticket) {
          const finalQR = generateSecureQRToken(ticket.ticket_number || `${booking.booking_ref}-${passIndex}`, event.slug, expiresAt);
          await supabase.from('tickets').update({ qr_token: finalQR }).eq('id', ticket.id);

          await supabase.from('attendees').insert({
            booking_id: booking.id,
            ticket_id: ticket.id,
            event_id: event.id,
            pass_index: passIndex,
            full_name: attendeeName,
            nic_number: attendeeNic,
            phone: attendeePhone,
            email: attendee_email.toLowerCase(),
            status: 'issued',
          });
        }
      }

      // Update sold count
      await supabase
        .from('ticket_tiers')
        .update({ sold: tier.sold + qty })
        .eq('id', tier.id);
    }

    // ── Send Confirmation Email (non-blocking) ────────────────
    const bookingForEmail: IBooking = {
      ...booking,
      booking_ref: booking.booking_ref,
    };
    sendBookingConfirmationEmail(bookingForEmail, {
      bank_name: event.bank_name,
      bank_account_name: event.bank_account_name,
      bank_account_no: event.bank_account_no,
      bank_branch: event.bank_branch,
    })
      .then((res) => console.log(`[Booking Email Dispatch Result]:`, res))
      .catch((err) => console.error('[Booking Email Dispatch Error]:', err));

    return Response.json(
      {
        success: true,
        data: booking,
        message: isFree ? 'Booking confirmed! Your free ticket has been issued.' : 'Booking received. Please complete payment to confirm your ticket.',
      } satisfies ApiResponse<typeof booking>,
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create booking';
    return Response.json({ success: false, error: msg } satisfies ApiResponse, { status: 500 });
  }
}

// ── GET: List bookings (admin) ────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const event_id = searchParams.get('event_id');
    const status = searchParams.get('status');
    const payment_status = searchParams.get('payment_status');
    const email = searchParams.get('email');
    const ref = searchParams.get('ref');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('bookings')
      .select('*, event:events(title,slug,date,venue), customer:customers(full_name,email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    const q = searchParams.get('q') || searchParams.get('search');
    if (event_id) query = query.eq('event_id', event_id);
    if (status) query = query.eq('status', status);
    if (payment_status) query = query.eq('payment_status', payment_status);
    if (email) query = query.ilike('attendee_email', `%${email}%`);
    if (ref) query = query.ilike('booking_ref', `%${ref}%`);
    if (q) {
      const cleanQ = q.trim();
      query = query.or(`booking_ref.ilike.%${cleanQ}%,attendee_email.ilike.%${cleanQ}%,attendee_name.ilike.%${cleanQ}%,attendee_phone.ilike.%${cleanQ}%,attendee_nic.ilike.%${cleanQ}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return Response.json({
      success: true,
      data,
      meta: { total: count ?? 0, page, limit },
    } satisfies ApiResponse);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch bookings';
    return Response.json({ success: false, error: msg } satisfies ApiResponse, { status: 500 });
  }
}

// ── PATCH: Update booking & attendee details (admin / authorized) ────────
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const {
      id,
      booking_id,
      booking_ref,
      attendee_name,
      attendee_email,
      attendee_phone,
      attendee_nic,
      address_line_1,
      address_line_2,
      city,
      district,
      postal_code,
      country,
      emergency_contact_name,
      emergency_contact_phone,
      company,
      job_title,
      special_notes,
      additional_attendees,
      tier_name,
      tier_label,
      quantity,
      unit_price,
      total_amount,
      payment_method,
      payment_status,
      status,
      admin_notes,
    } = body;

    const targetBookingId = id || booking_id;

    if (!targetBookingId && !booking_ref) {
      return Response.json(
        { success: false, error: 'Target booking id or booking_ref is required' } satisfies ApiResponse,
        { status: 400 }
      );
    }

    // Resolve target booking with event details
    let query = supabase.from('bookings').select('*, events(*)').limit(1);
    if (targetBookingId) {
      query = query.eq('id', targetBookingId);
    } else {
      query = query.eq('booking_ref', booking_ref);
    }

    const { data: existingList, error: fetchErr } = await query;
    if (fetchErr || !existingList || existingList.length === 0) {
      return Response.json(
        { success: false, error: 'Booking record not found' } satisfies ApiResponse,
        { status: 404 }
      );
    }

    const existingBooking = existingList[0];
    const bId = existingBooking.id;
    const wasConfirmedOrPaid = existingBooking.status === 'confirmed' || existingBooking.payment_status === 'paid';

    // Prepare update object for bookings table
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (attendee_name !== undefined) updates.attendee_name = attendee_name.trim();
    if (attendee_email !== undefined) updates.attendee_email = attendee_email.toLowerCase().trim();
    if (attendee_phone !== undefined) updates.attendee_phone = normalisePhone(attendee_phone);
    if (attendee_nic !== undefined) updates.attendee_nic = attendee_nic.trim();
    if (address_line_1 !== undefined) updates.address_line_1 = address_line_1;
    if (address_line_2 !== undefined) updates.address_line_2 = address_line_2;
    if (city !== undefined) updates.city = city;
    if (district !== undefined) updates.district = district;
    if (postal_code !== undefined) updates.postal_code = postal_code;
    if (country !== undefined) updates.country = country;
    if (emergency_contact_name !== undefined) updates.emergency_contact_name = emergency_contact_name;
    if (emergency_contact_phone !== undefined) updates.emergency_contact_phone = emergency_contact_phone;
    if (company !== undefined) updates.company = company;
    if (job_title !== undefined) updates.job_title = job_title;
    if (special_notes !== undefined) updates.special_notes = special_notes;
    if (additional_attendees !== undefined) updates.additional_attendees = additional_attendees;
    if (tier_name !== undefined) updates.tier_name = tier_name;
    if (tier_label !== undefined) updates.tier_label = tier_label;
    if (quantity !== undefined) updates.quantity = Number(quantity);
    if (unit_price !== undefined) updates.unit_price = Number(unit_price);
    if (total_amount !== undefined) updates.total_amount = Number(total_amount);
    if (payment_method !== undefined) updates.payment_method = payment_method;
    if (payment_status !== undefined) updates.payment_status = payment_status;
    if (status !== undefined) updates.status = status;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    const isNowConfirmedOrPaid = (updates.status === 'confirmed' || updates.payment_status === 'paid');

    // Update bookings table
    const { data: updatedBooking, error: updateErr } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bId)
      .select('*, events(*)')
      .single();

    if (updateErr) throw updateErr;

    // Sync changes to attendees table if present
    const attendeeUpdates: Record<string, any> = {};
    if (attendee_name !== undefined) attendeeUpdates.full_name = attendee_name.trim();
    if (attendee_email !== undefined) attendeeUpdates.email = attendee_email.toLowerCase().trim();
    if (attendee_phone !== undefined) attendeeUpdates.phone = normalisePhone(attendee_phone);
    if (attendee_nic !== undefined) attendeeUpdates.nic_number = attendee_nic.trim();
    if (status !== undefined || payment_status !== undefined) {
      attendeeUpdates.status = (status === 'confirmed' || payment_status === 'paid') ? 'issued' : 'pending';
    }

    if (Object.keys(attendeeUpdates).length > 0) {
      await supabase.from('attendees').update(attendeeUpdates).eq('booking_id', bId);
    }

    // Sync changes to tickets table if present
    const ticketUpdates: Record<string, any> = {};
    if (attendee_name !== undefined) ticketUpdates.attendee_name = attendee_name.trim();
    if (attendee_phone !== undefined) ticketUpdates.attendee_phone = normalisePhone(attendee_phone);
    if (attendee_nic !== undefined) ticketUpdates.attendee_nic = attendee_nic.trim();

    if (Object.keys(ticketUpdates).length > 0) {
      await supabase.from('tickets').update(ticketUpdates).eq('booking_id', bId);
    }

    // If booking was newly approved/confirmed via PATCH, issue tickets and dispatch confirmation email!
    if (isNowConfirmedOrPaid && !wasConfirmedOrPaid) {
      try {
        const eventDate = updatedBooking.events?.date || updatedBooking.event_date || new Date().toISOString();
        const eventSlug = updatedBooking.event_slug || 'event';
        const expiresAt = qrExpiryFromEventDate(eventDate);
        const qty = Math.max(1, updatedBooking.quantity || 1);
        const extras = Array.isArray(updatedBooking.additional_attendees) ? updatedBooking.additional_attendees : [];

        let issuedTicket: ITicket | undefined;

        // Check if tickets already exist
        const { data: existingTickets } = await supabase.from('tickets').select('*').eq('booking_id', bId);

        if (!existingTickets || existingTickets.length === 0) {
          for (let i = 0; i < qty; i++) {
            const passIndex = i + 1;
            const attendeeName = i === 0 ? updatedBooking.attendee_name : (extras[i - 1]?.name || `Attendee ${passIndex}`);
            const attendeeNic = i === 0 ? updatedBooking.attendee_nic : (extras[i - 1]?.nic || updatedBooking.attendee_nic);
            const attendeePhone = i === 0 ? updatedBooking.attendee_phone : (extras[i - 1]?.phone || updatedBooking.attendee_phone);

            const tempToken = generateSecureQRToken(`TEMP-${updatedBooking.booking_ref}-${passIndex}`, eventSlug, expiresAt);

            const { data: ticket } = await supabase
              .from('tickets')
              .insert({
                booking_id: bId,
                customer_id: updatedBooking.customer_id,
                qr_token: tempToken,
                qr_expires_at: expiresAt.toISOString(),
                status: 'issued',
                attendee_name: attendeeName,
                attendee_nic: attendeeNic,
                attendee_phone: attendeePhone,
                pass_index: passIndex,
              })
              .select()
              .single();

            if (ticket) {
              const finalQR = generateSecureQRToken(ticket.ticket_number || `${updatedBooking.booking_ref}-${passIndex}`, eventSlug, expiresAt);
              await supabase.from('tickets').update({ qr_token: finalQR }).eq('id', ticket.id);

              await supabase.from('attendees').insert({
                booking_id: bId,
                ticket_id: ticket.id,
                event_id: updatedBooking.event_id,
                pass_index: passIndex,
                full_name: attendeeName,
                nic_number: attendeeNic,
                phone: attendeePhone,
                email: updatedBooking.attendee_email,
                status: 'issued',
              });

              if (i === 0) issuedTicket = ticket as ITicket;
            }
          }
        } else {
          issuedTicket = existingTickets[0] as ITicket;
        }

        // Dispatch confirmation email
        sendPaymentApprovedEmail(updatedBooking as IBooking, issuedTicket).catch((err) =>
          console.error('[sendPaymentApprovedEmail Error in PATCH]:', err)
        );
      } catch (issueErr) {
        console.error('[Ticket Issuance Error in PATCH]:', issueErr);
      }
    }

    return Response.json({
      success: true,
      data: updatedBooking,
      message: 'Booking & attendee details updated successfully',
    } satisfies ApiResponse);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update booking';
    return Response.json({ success: false, error: msg } satisfies ApiResponse, { status: 500 });
  }
}

