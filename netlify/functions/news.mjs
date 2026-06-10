// LahariUndo news proxy — the app's ONLY backend. Stateless and privacy-clean:
// it stores nothing, logs no request data or IPs, and only relays public
// headlines from Google News RSS (free, no API key).
//
// Netlify Functions v2: the `config.path` binds this directly to /api/news,
// so it is served before the SPA catch-all redirect.

export const config = { path: '/api/news' };

const TTL_MS = 20 * 60 * 1000; // 20 min in-process cache (warm lambda reuse)
const CDN_MAXAGE = 900; // 15 min browser
const CDN_SMAXAGE = 1800; // 30 min CDN edge
const cache = new Map(); // topic -> { at, body }  (no user data — just headlines)

// Topic → Google News search query.
const QUERIES = {
  toofan: '"Operation Toofan" Kerala',
  all: '("Operation Toofan" OR "Kerala drugs" OR "Kerala NDPS" OR "narcotics Kerala" OR "Kerala excise drug")',
};

// Relevance: a headline must mention something on-topic.
const RELEVANT = /\b(drug|drugs|narcotic|narcotics|ndps|toofan|excise|ganja|cannabis|mdma|opioid|heroin|peddl|smuggl|seiz|de-?addiction|vimukthi)\b/i;

// Reputable outlets we’ll surface (matched against the RSS source name).
const REPUTABLE = [
  'the hindu', 'times of india', 'indian express', 'new indian express', 'hindustan times',
  'deccan', 'manorama', 'mathrubhumi', 'onmanorama', 'news minute', 'ndtv', 'pti', 'ani',
  'india today', 'news18', 'mint', 'scroll', 'firstpost', 'the week', 'asianet', 'madhyamam',
  'kaumudi', 'mediaone', 'the print', 'theprint', 'tribune', 'financial express', 'english.manorama',
];

// Calm filter — skip sensational/graphic or unrelated tragedy headlines.
const BLOCK = /\b(suicide|rape|gruesome|horrific|mutilat|dead body|self[-\s]?harm|hang(s|ed|ing)?)\b/i;

function decodeEntities(s = '') {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? m[1] : '';
}

function parseItems(xml) {
  const out = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRe.exec(xml)) && out.length < 60) {
    const block = m[1];
    let title = decodeEntities(tag(block, 'title'));
    const url = decodeEntities(tag(block, 'link'));
    const publishedAt = decodeEntities(tag(block, 'pubDate'));
    const source = decodeEntities(tag(block, 'source'));
    // Google News titles are "Headline - Source" — strip the trailing source.
    if (source && title.endsWith(` - ${source}`)) {
      title = title.slice(0, -(source.length + 3)).trim();
    }
    if (title && url) out.push({ title, source, url, publishedAt });
  }
  return out;
}

async function fetchNews(topic) {
  const q = encodeURIComponent(QUERIES[topic] || QUERIES.all);
  const rss = `https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en`;
  const res = await fetch(rss, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LahariUndoNewsBot/1.0)' },
  });
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  const xml = await res.text();

  const all = parseItems(xml).filter((it) => RELEVANT.test(it.title) && !BLOCK.test(it.title));
  // Prefer reputable sources; relax to relevance-only if that leaves too few.
  const reputable = all.filter((it) => REPUTABLE.some((r) => it.source.toLowerCase().includes(r)));
  const chosen = reputable.length >= 4 ? reputable : all;

  // Dedupe by title, cap the payload small.
  const seen = new Set();
  const items = [];
  for (const it of chosen) {
    const key = it.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(it);
    if (items.length >= 12) break;
  }
  return items;
}

function json(body, extraHeaders, stale) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, max-age=${CDN_MAXAGE}, s-maxage=${CDN_SMAXAGE}, stale-while-revalidate=600`,
      'X-Cache': stale ? 'HIT' : 'MISS',
      ...extraHeaders,
    },
  });
}

export default async (req) => {
  // CORS locked to our own domain (set ALLOWED_ORIGIN in Netlify env).
  // Same-origin requests from the app don't need it; cross-site reads are denied.
  const allowed = process.env.ALLOWED_ORIGIN || '';
  const origin = req.headers.get('origin') || '';
  const cors = allowed && origin === allowed ? { 'Access-Control-Allow-Origin': allowed, Vary: 'Origin' } : {};

  const topic = new URL(req.url).searchParams.get('topic') === 'toofan' ? 'toofan' : 'all';

  const now = Date.now();
  const hit = cache.get(topic);
  if (hit && now - hit.at < TTL_MS) return json(hit.body, cors, true);

  try {
    const items = await fetchNews(topic);
    const body = { topic, fetchedAt: new Date().toISOString(), items };
    cache.set(topic, { at: now, body });
    return json(body, cors, false);
  } catch {
    if (hit) return json(hit.body, cors, true); // serve stale on upstream failure
    return json({ topic, fetchedAt: new Date().toISOString(), items: [] }, cors, false);
  }
};
