// ─────────────────────────────────────────────────────────────
//  All wedding details live here. Edit this one file to update
//  the invitation, the admin link generator and the countdown.
// ─────────────────────────────────────────────────────────────

export const WEDDING = {
  brideName: 'Nimali',
  groomName: 'Sachin',
  brideParentsShort: 'Mr. & Mrs. Herath',
  groomParentsShort: 'Mr. & Mrs. Rohan',
  brideParents: 'Daughter of Mr. & Mrs. Herath',
  groomParents: 'Son of Mr. & Mrs. Rohan',

  // ISO date-time used by the countdown (Sri Lanka time)
  dateISO: '2026-12-04T08:30:00+05:30',
  dayLabel: 'Friday, December 04',
  weekday: 'Friday',
  yearLabel: 'The Year Two Thousand Twenty Six',
  dateShort: '04 . 12 . 2026',
  dateLong: 'December 04, 2026',
  monthYear: 'December 2026',

  startTime: '08:30 AM',
  timeRange: '08:30 AM – 04:00 PM',
  poruwaTime: '08:31 AM',
  ceremonyTitle: 'Poruwa Ceremony at 08:31 AM',
  receptionTime: '08:30 AM – 04:00 PM',

  venueName: 'Thilanka Hotel',
  venueCity: 'Kandy',
  venueAddress: 'Kandy, Sri Lanka',
  mapsUrl: 'https://maps.app.goo.gl/x2R34apCYoM7Tmku9',
  mapEmbedUrl:
    'https://maps.google.com/maps?q=Thilanka%20Hotel%2C%20Kandy&ll=7.2912101,80.6461791&z=16&output=embed',

  rsvpContacts: [
    { name: 'Sachin', display: '070 443 6190', intl: '94704436190' },
    { name: 'Nimali', display: '071 131 9688', intl: '94711319688' },
  ],

  timeline: [
    { time: '08:30 AM', title: 'Welcome', desc: 'A warm welcome to our loved ones at Thilanka Hotel', icon: 'heart' },
    { time: '08:31 AM', title: 'Poruwa Ceremony', desc: 'The traditional and sacred Poruwa ceremony at the auspicious time', icon: 'music' },
    { time: '04:00 PM', title: 'Farewell', desc: 'Farewell as we begin our journey together', icon: 'party' },
  ] as const,
};

// Paste the Google Apps Script Web App URL here (or set VITE_GOOGLE_SCRIPT_URL in .env / Vercel).
export const GOOGLE_SCRIPT_URL: string =
  (import.meta.env.VITE_GOOGLE_SCRIPT_URL as string | undefined) ||
  'https://script.google.com/macros/s/AKfycbyrxaULH1CJwmKnCBmHIGjpQq-p2x99RFPIDKNc077TN7Vkpy3dPS7dNa6lcv6_H1oYqw/exec';

// ─── Guest personalisation ──────────────────────────────────

export const PREFIXES = ['Mr.', 'Mrs.', 'Miss', 'Mr. & Mrs.', 'Family', 'Dear'] as const;
export type Prefix = (typeof PREFIXES)[number];

/** Combines prefix + name. "Dear" is a greeting style, so it adds nothing to the name. */
export function buildDisplayName(prefix: Prefix, name: string): string {
  const n = name.trim().replace(/\s+/g, ' ');
  if (!n) return '';
  switch (prefix) {
    case 'Family':
      return `${n} and Family`;
    case 'Dear':
      return n;
    default:
      return `${prefix} ${n}`;
  }
}

/** Reads the guest display name from the URL: /{name} (or legacy ?prefix=&name=). */
export function getGuestFromUrl(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const legacy = params.get('name');
  if (legacy) return [params.get('prefix'), legacy].filter(Boolean).join(' ').trim();

  const seg = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (!seg || seg.toLowerCase() === 'admin') return '';
  if (/\.(html?|js|css|png|jpe?g|webp|ico|svg|mp3)$/i.test(seg)) return '';
  try {
    return decodeURIComponent(seg).replace(/\s+/g, ' ').trim();
  } catch {
    return '';
  }
}
