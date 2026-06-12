/** Shared display formatting and label maps used across the UI. */

export function formatEUR(amount: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** YYYY-MM-DD in UTC — the canonical wire format for booking dates. */
export function toDateKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export const CONDITION_LABELS: Record<string, string> = {
  LIKE_NEW: "Like new",
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const LISTING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending review",
  APPROVED: "Offer made",
  REJECTED: "Declined",
  SOLD: "Bought",
};

export const PHONE_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  SOLD: "Sold",
  HIDDEN: "Hidden",
};

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export const BOOKING_STATUS_TONES: Record<string, BadgeTone> = {
  PENDING: "warning",
  CONFIRMED: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export const LISTING_STATUS_TONES: Record<string, BadgeTone> = {
  PENDING: "warning",
  APPROVED: "info",
  REJECTED: "danger",
  SOLD: "success",
};

export const PHONE_STATUS_TONES: Record<string, BadgeTone> = {
  AVAILABLE: "success",
  SOLD: "neutral",
  HIDDEN: "warning",
};
