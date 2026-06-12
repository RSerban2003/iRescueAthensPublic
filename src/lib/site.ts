/**
 * Central site identity & contact details.
 * Replace the placeholder values with real business data before going live.
 */
export const SITE = {
  name: "iRescue Athens",
  tagline: "Phone repair & refurbished devices in Athens",
  phone: "+30 210 000 0000",
  email: "contact@example.com",
  address: "12 Ermou Street, Athens 105 63",
  openingHours: "Mon–Sat 10:00–20:00",
  socials: {
    instagram: "https://instagram.com/your-handle",
    facebook: "https://facebook.com/your-page",
    tiktok: "https://tiktok.com/@your-handle",
  },
} as const;

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Fallback booking slots used until an admin configures their own. */
export const DEFAULT_SLOTS = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];
