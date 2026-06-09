import type { AppData } from '../types';
import { isPlaceholderValue } from './verify';

export type ContactChannel = 'call' | 'whatsapp' | 'web' | 'email';

export interface ResolvedContact {
  id: string;
  channel: ContactChannel;
  value: string;
  label_en: string;
  label_ml: string;
  verified: boolean;
}

/**
 * Single source of truth lookup. Resolves a contact by id from data.json —
 * searches `resources` first, then `helplines`. New features reference
 * contacts by id only; the digits/links live exclusively in data.json.
 */
export function findContact(data: AppData | null, id: string): ResolvedContact | null {
  if (!data) return null;

  const resource = data.resources?.find((r) => r.id === id);
  if (resource) {
    return {
      id: resource.id,
      channel: resource.channel,
      value: resource.value,
      label_en: resource.label_en,
      label_ml: resource.label_ml,
      verified: resource.verified && !isPlaceholderValue(resource.value),
    };
  }

  const helpline = data.helplines?.find((h) => h.id === id);
  if (helpline) {
    return {
      id: helpline.id,
      channel: helpline.type,
      value: helpline.value,
      label_en: helpline.label_en,
      label_ml: helpline.label_ml,
      verified: !isPlaceholderValue(helpline.value),
    };
  }

  return null;
}

/** Resolve several contacts by id, dropping any that are missing. */
export function findContacts(data: AppData | null, ids: string[]): ResolvedContact[] {
  return ids.map((id) => findContact(data, id)).filter((c): c is ResolvedContact => c !== null);
}
