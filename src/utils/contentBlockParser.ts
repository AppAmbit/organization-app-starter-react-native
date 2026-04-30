import { ContentDetailItem } from '../models/FeedModel';

export function toList(raw: any): any[] {
  if (Array.isArray(raw)) { return raw; }
  if (raw && Array.isArray(raw.data)) { return raw.data; }
  if (raw && Array.isArray(raw.items)) { return raw.items; }
  if (raw && Array.isArray(raw.results)) { return raw.results; }
  return [];
}

export function resolveString(v: any): string {
  if (!v) { return ''; }
  if (Array.isArray(v)) { v = v[0]; }
  if (v && typeof v === 'object') {
    v = v.value ?? v.key ?? v.name ?? v.title ?? v.label ?? v.id ?? v;
  }
  return String(v ?? '').trim();
}

export function parseBlock(raw: any): ContentDetailItem | null {
  if (!raw || typeof raw !== 'object') { return null; }
  const type = resolveString(raw.type) as ContentDetailItem['type'];
  if (!(['button', 'text', 'image', 'video'] as const).includes(type)) { return null; }
  return {
    id: raw.id ?? String(Math.random()),
    lookup_key: resolveString(raw.lookup_key) || null,
    type,
    text: resolveString(raw.text) || null,
    button_text: resolveString(raw.button_text) || null,
    button_color: resolveString(raw.button_color) || null,
    button_url: resolveString(raw.button_url) || null,
    banner_video: resolveString(raw.banner_video) || null,
    banner_image: raw.banner_image ?? null,
    banner_image_url: resolveString(raw.banner_image_url) || null,
  };
}

export function resolveRelationId(raw: any): string | null {
  if (!raw) { return null; }
  if (typeof raw === 'string') { return raw; }
  const item = Array.isArray(raw) ? raw[0] : raw;
  if (!item) { return null; }
  if (typeof item === 'string') { return item; }
  if (item.id) { return String(item.id); }
  if (item.data?.id) { return String(item.data.id); }
  return null;
}

export function isRelationId(raw: any): boolean {
  if (typeof raw === 'string') { return true; }
  const item = Array.isArray(raw) ? raw[0] : raw;
  if (!item || typeof item !== 'object') { return false; }
  const keys = Object.keys(item);
  // A plain relation stub only has `id` (and optionally `entry_id`)
  return keys.length <= 2 && (keys.includes('id') || keys.includes('entry_id'));
}
