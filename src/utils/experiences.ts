export interface SavedExperience {
 id: string;
 name: string;
 anonymous: boolean;
 text: string;
 createdAt: string;
}

const STORAGE_KEY = 'lahariundo-experiences';
const MAX_SAVED = 20;

export function loadUserExperiences(): SavedExperience[] {
 try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as SavedExperience[];
  return Array.isArray(parsed) ? parsed : [];
 } catch {
  return [];
 }
}

export function saveUserExperience(
 exp: Pick<SavedExperience, 'name' | 'anonymous' | 'text'>,
): SavedExperience {
 const entry: SavedExperience = {
  ...exp,
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
 };
 const list = [entry, ...loadUserExperiences()].slice(0, MAX_SAVED);
 localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
 return entry;
}

export function deleteUserExperience(id: string): void {
 const list = loadUserExperiences().filter((e) => e.id !== id);
 localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
