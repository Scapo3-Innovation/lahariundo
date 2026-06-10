import { useMemo } from 'react';
import { useAppData } from '../context/DataContext';
import { findContact, type ContactChannel } from '../utils/contacts';

/**
 * Maps an interpolation token (used inside i18n strings as {{token}}) to a
 * contact id in data.json. This is what keeps numbers embedded in translation
 * text in sync with the single source of truth — edit data.json once and the
 * text updates everywhere.
 */
const TOKEN_TO_ID: Record<string, string> = {
  vimukthi: 'vimukthi-14405',
  manas: 'manas-call',
  keralaWa: 'kerala-wa-antinarcotics',
  ncbWeb: 'manas-web',
  ncbEmail: 'manas-email',
  emergency: 'emergency-112',
  ambulance: 'ambulance-108',
  police: 'police-100',
  legalAid: 'legal-aid-15100',
  deaddiction: 'deaddiction-14446',
  cell1: 'antinarcotics-cell-1',
  cell2: 'antinarcotics-cell-2',
};

/** For web links, show a clean host (no protocol/trailing slash) inside prose. */
function displayValue(channel: ContactChannel, value: string): string {
  if (channel === 'web') return value.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  return value;
}

/**
 * Returns an object of { token: value } pulled live from data.json, suitable
 * for spreading into a t() call so embedded numbers render from data.json.
 */
export function useContactTokens(): Record<string, string> {
  const { data } = useAppData();
  return useMemo(() => {
    const tokens: Record<string, string> = {};
    for (const [token, id] of Object.entries(TOKEN_TO_ID)) {
      const c = findContact(data, id);
      if (c) tokens[token] = displayValue(c.channel, c.value);
    }
    return tokens;
  }, [data]);
}
