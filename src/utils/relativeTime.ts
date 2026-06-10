// Compact, bilingual relative time. Pure formatting — no storage, no network.
export function relativeTime(iso: string, isML: boolean): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const min = Math.floor(diffMs / 60000);

  if (min < 1) return isML ? 'ഇപ്പോൾ' : 'just now';
  if (min < 60) return isML ? `${min} മിനിറ്റ് മുൻപ്` : `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return isML ? `${hr} മണിക്കൂർ മുൻപ്` : `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return isML ? `${day} ദിവസം മുൻപ്` : `${day}d ago`;
  const wk = Math.floor(day / 7);
  return isML ? `${wk} ആഴ്ച മുൻപ്` : `${wk}w ago`;
}
