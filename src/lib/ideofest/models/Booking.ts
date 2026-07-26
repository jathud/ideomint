import { Schema, model, models } from 'mongoose';

// ── Payment sub-schema ────────────────────────────────────────
const PaymentSchema = new Schema(
  {
    gateway: { type: String, enum: ['razorpay', 'free', 'slip_upload', 'direct'], default: 'slip_upload' },
    gatewayOrderId: { type: String },
    gatewayPaymentId: { type: String },
    gatewaySignature: { type: String },
    paymentSlipUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'pending_verification', 'paid', 'failed', 'rejected', 'refunded'],
      default: 'pending_verification',
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    paidAt: { type: Date },
  },
  { _id: false }
);

// ── Booking schema ────────────────────────────────────────────
const BookingSchema = new Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    eventId: { type: String, required: true },
    eventSlug: { type: String, required: true },
    eventTitle: { type: String, required: true },
    eventDate: { type: Date, required: true },
    venue: { type: String, required: true },
    attendeeName: { type: String, required: true, trim: true },
    attendeeEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    attendeePhone: { type: String },
    ticketTier: {
      type: String,
      enum: ['free', 'early_bird', 'standard', 'vip'],
      required: true,
    },
    ticketTierLabel: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, max: 10 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    payment: { type: PaymentSchema, required: true },
    paymentSlipUrl: { type: String },
    qrPayload: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'pending_verification', 'confirmed', 'cancelled', 'rejected'],
      default: 'pending_verification',
    },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },
  },
  { timestamps: true }
);

BookingSchema.index({ bookingId: 1 });
BookingSchema.index({ eventId: 1 });
BookingSchema.index({ attendeeEmail: 1 });
BookingSchema.index({ attendeePhone: 1 });   // for phone-based ticket lookup
BookingSchema.index({ 'payment.status': 1 });
BookingSchema.index({ checkedIn: 1, eventId: 1 });

export const Booking = models.Booking || model('Booking', BookingSchema);
