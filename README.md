# Help Hub — Kerala Drug Help

A mobile-first, bilingual (Malayalam + English) civic web app supporting Kerala's **Operation Toofan** anti-drug drive.

**The one rule that shapes everything:** this app NEVER stores, collects, or transmits personal data. No accounts, no databases, no backends. It educates, routes people to official help, and locates de-addiction centres.

---

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Before you publish — critical checklist

### 1. Verify every phone number

All phone numbers in `public/data.json` are marked `VERIFY_*`. **Replace them with verified official numbers before going live.** Wrong contact info in a help app is dangerous.

Verify against:
- **Vimukthi Mission**: https://keralaexcise.gov.in
- **Kerala Police**: https://keralapolice.gov.in

Numbers to verify:
| Field | What it is |
|---|---|
| `VERIFY_POLICE_ANTINARCOTICS_NUMBER` | Kerala Police anti-narcotics helpline |
| `VERIFY_POLICE_WHATSAPP_NUMBER` | Kerala Police WhatsApp tip line (digits only, no +91) |
| `VERIFY_TVM_CENTRE_NUMBER` | Vimukthi De-addiction Centre, Thiruvananthapuram |
| `VERIFY_KOLLAM_CENTRE_NUMBER` | Vimukthi De-addiction Centre, Kollam |
| *(…and so on for each district)* | |

The Vimukthi counselling helpline **14405** is already a verified official number and requires no changes.

### 2. Verify centre addresses

Replace all `VERIFY_*_ADDRESS` and `VERIFY_*_ADDRESS_ML` fields in `public/data.json` with the actual verified addresses from official sources.

### 3. Review Malayalam text

Have a native Malayalam speaker review `src/i18n/ml.json` before publishing.

### 4. Test on a real Android device

- Check that Malayalam fonts render correctly (Noto Sans Malayalam from Google Fonts).
- Check that click-to-call and WhatsApp links open correctly.
- Test on a slow connection.

---

## Filling in `public/data.json`

```json
{
  "helplines": [...],
  "centres": [...]
}
```

**Helpline fields:**
```json
{
  "id": "unique-id",
  "label_en": "English label",
  "label_ml": "Malayalam label",
  "type": "call | whatsapp",
  "value": "phone number (digits only, no +91)",
  "emergency": true | false
}
```

**Centre fields:**
```json
{
  "id": "unique-id",
  "name_en": "English name",
  "name_ml": "Malayalam name",
  "district": "District name",
  "type": ["detox", "counselling", "op", "inpatient"],
  "cost": "free | subsidised | paid",
  "phone": "phone number",
  "lat": 9.9312,
  "lng": 76.2673,
  "address_en": "Full address in English",
  "address_ml": "Full address in Malayalam"
}
```

---

## Project structure

```
src/
  i18n/
    index.ts          # i18next setup
    en.json           # English translations
    ml.json           # Malayalam translations
  components/
    Layout.tsx        # Header + nav + footer + sticky contact bar
    ContactBar.tsx    # Sticky bottom bar with official helpline buttons
    LanguageToggle.tsx
    LeaveQuickly.tsx  # Safety button — navigates away instantly
    CentreCard.tsx    # Card for a single de-addiction centre
    CentreMap.tsx     # Leaflet/OSM map (lazy-loaded)
  pages/
    Home.tsx          # / — Situation router landing page
    Worried.tsx       # /worried — warning signs + how to help
    GetHelp.tsx       # /get-help — centre locator (list + map)
    Report.tsx        # /report — official anonymous reporting channels
    Learn.tsx         # /learn — awareness content
    Parents.tsx       # /parents — parent & teacher toolkit
    Screening.tsx     # /screening — client-side self-assessment
    About.tsx         # /about — mission + data promise + sources
  types.ts
  App.tsx
  main.tsx
  index.css
public/
  data.json           # All centre and helpline data — edit here
index.html
```

---

## Tech stack

| | |
|---|---|
| Framework | Vite + React + TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| i18n | react-i18next (Malayalam + English) |
| Maps | Leaflet + react-leaflet + OpenStreetMap (no API key) |
| Icons | lucide-react |
| Data | Static `public/data.json` |
| Backend | None |
| Database | None |

---

## Deploying

### Vercel (recommended)
1. Push to GitHub.
2. Import the repo in Vercel.
3. Framework preset: **Vite**. Build command: `npm run build`. Output dir: `dist`.
4. Deploy.

### Netlify
1. Push to GitHub, new site → import from Git.
2. Build command: `npm run build`. Publish dir: `dist`.
3. Add a `netlify.toml` for client-side routing:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### GitHub Pages
Add `base: '/your-repo-name/'` to `vite.config.ts` and configure the Pages action.

---

## Privacy guarantee (technical)

- No backend, no server, no database.
- Self-screening (`/screening`) runs in React state only — answers are never written to localStorage, sessionStorage, or any network request.
- Geolocation (`/get-help` → "Find nearest") uses `navigator.geolocation` in-browser only; coordinates are never transmitted.
- Helpline buttons use `tel:` and `https://wa.me/` — tapping opens the device's own app directly; this app never intermediates the call or message.
- No analytics, tracking pixels, or ad scripts.

---

## Adding or editing content

All copy lives in `src/i18n/en.json` and `src/i18n/ml.json`. Edit those files to update any text without touching component code.

To add a new centre: add an entry to the `centres` array in `public/data.json`.

---

## Outreach suggestion

Once verified and deployed, share with:
- Your local district Vimukthi office
- Your local police station's community team
- College NSS / Student Police Cadet units
- School principals and counsellors

A help app only helps if people find it.
