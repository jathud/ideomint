import { z } from 'zod';
import { portfolioServices } from './categories';
import type { Project } from './legacy-projects';

const text = (max: number) => z.string().trim().max(max);
export const photoSchema = z.object({
  src: z.string().max(300).refine(value => !value.split('/').some(part => part === '.' || part === '..') && (/^\/portfolio\/[a-zA-Z0-9_./-]+\.(?:jpg|jpeg|png|webp)$/i.test(value) || /^\/api\/portfolio\/media\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:jpg|png|webp)$/.test(value)), 'Choose an uploaded or existing portfolio image.'),
  alt: text(240).min(3, 'Write a descriptive image alternative.'),
  theme: text(60).min(1, 'Give every image a photo group.'),
});
export const contentSchema = z.object({
  title: text(80).min(2), subtitle: text(100), description: text(1500).min(20),
  role: text(300).min(2), location: text(120), label: text(140),
  services: z.array(z.enum(portfolioServices)).min(1).max(3).refine(values => new Set(values).size === values.length),
  photos: z.array(photoSchema).min(1, 'Add at least one image.').max(60),
});
export type PortfolioContent = z.infer<typeof contentSchema>;
const editableContentSchema = contentSchema.extend({
  title: text(80), description: text(1500), role: text(300),
  photos: z.array(photoSchema.extend({ alt: text(240), theme: text(60) })).max(60),
});
export const draftSchema = z.object({
  id: z.uuid(), version: z.number().int().min(0),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens.'),
  sort_order: z.number().int().min(0).max(10000), featured: z.boolean(), content: editableContentSchema,
}).superRefine((value, context) => {
  value.content.photos.forEach((photo, index) => {
    if (photo.src.startsWith('/api/portfolio/media/') && !photo.src.startsWith(`/api/portfolio/media/${value.id}/`)) {
      context.addIssue({ code: 'custom', path: ['content', 'photos', index, 'src'], message: 'An upload must belong to this project.' });
    }
  });
});
export type DraftInput = z.infer<typeof draftSchema>;
export interface PortfolioRecord {
  id: string; slug: string; version: number; sort_order: number; featured: boolean;
  status: 'draft' | 'published' | 'archived'; draft: PortfolioContent; updated_at: string;
}
export function toGalleryProject(id: string, content: PortfolioContent, index: number): Project {
  return { ...content, id, index: String(index + 1).padStart(2, '0'), themes: [...new Set(content.photos.map(photo => photo.theme))] };
}
export function validateImage(bytes: Uint8Array, mime: string): 'jpg' | 'png' | 'webp' | null {
  if (!bytes.length || bytes.length > 10 * 1024 * 1024) return null;
  if (mime === 'image/jpeg' && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'jpg';
  if (mime === 'image/png' && bytes.slice(0, 8).every((value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index]) && bytes.length >= 24) return 'png';
  if (mime === 'image/webp' && bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'webp';
  return null;
}
