import mongoose, { Schema, model, models } from 'mongoose';

// ── TicketTier sub-schema ─────────────────────────────────────
const TicketTierSchema = new Schema(
  {
    name: { type: String, enum: ['free', 'early_bird', 'standard', 'vip'], required: true },
    label: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    capacity: { type: Number, required: true, min: 1 },
    sold: { type: Number, default: 0 },
    perks: [{ type: String }],
  },
  { _id: false }
);

// ── Event schema ──────────────────────────────────────────────
const EventSchema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['music', 'tech', 'art', 'business', 'food', 'sports', 'wellness', 'community'],
      required: true,
    },
    date: { type: Date, required: true },
    endDate: { type: Date },
    venue: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, default: 'India' },
    imageUrl: { type: String, required: true },
    galleryUrls: [{ type: String }],
    ticketTiers: { type: [TicketTierSchema], required: true },
    organizerId: { type: String, required: true },
    organizerName: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'sold_out', 'cancelled', 'completed'],
      default: 'draft',
    },
    tags: [{ type: String }],
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

EventSchema.index({ slug: 1 });
EventSchema.index({ status: 1, date: 1 });
EventSchema.index({ organizerId: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ featured: 1 });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Event = models.Event || model('Event', EventSchema);
