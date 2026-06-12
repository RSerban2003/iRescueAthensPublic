import { z } from "zod";

/**
 * Zod schemas for every API payload. Enum values mirror the Prisma enums as
 * string literals so this module stays safe to import from client components.
 */

export const CONDITIONS = ["LIKE_NEW", "EXCELLENT", "GOOD", "FAIR"] as const;
export const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
export const LISTING_STATUSES = ["PENDING", "APPROVED", "REJECTED", "SOLD"] as const;
export const PHONE_STATUSES = ["AVAILABLE", "SOLD", "HIDDEN"] as const;
export const PAYMENT_METHODS = ["ONLINE", "IN_STORE"] as const;

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a date in YYYY-MM-DD format");

const timeSlot = z.string().regex(/^\d{2}:\d{2}$/, "Expected a time in HH:MM format");

const phoneNumber = z
  .string()
  .min(7, "Phone number looks too short")
  .max(20, "Phone number looks too long")
  .regex(/^\+?[\d\s()-]+$/, "Phone number can contain digits, spaces and + ( ) -");

export const contactInfoSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.email("Please enter a valid email address").max(200),
  phone: phoneNumber,
});

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.email("Please enter a valid email address").max(200),
  phone: phoneNumber.optional().or(z.literal("")),
  subject: z.string().trim().min(3, "Please add a subject").max(150),
  message: z.string().trim().min(10, "Please tell us a bit more").max(5000),
});

export const repairBookingSchema = z.object({
  brand: z.string().trim().min(1).max(50),
  model: z.string().trim().min(1).max(80),
  issues: z.array(z.string().trim().min(1).max(120)).min(1, "Select at least one issue").max(10),
  date: dateOnly,
  timeSlot,
  contact: contactInfoSchema,
  notes: z.string().trim().max(2000).optional(),
});

export const purchaseBookingSchema = z.object({
  phoneId: z.string().min(1),
  date: dateOnly,
  timeSlot,
  contact: contactInfoSchema,
  paymentMethod: z.enum(PAYMENT_METHODS),
  notes: z.string().trim().max(2000).optional(),
});

export const listingSchema = z.object({
  brand: z.string().trim().min(1).max(50),
  model: z.string().trim().min(1).max(80),
  storage: z.string().trim().min(1).max(30),
  condition: z.enum(CONDITIONS),
  description: z.string().trim().max(2000).optional(),
  askingPrice: z.coerce.number().positive("Price must be positive").max(10000),
  images: z.array(z.string().max(500)).max(5).default([]),
  contact: contactInfoSchema,
});

export const bookingUpdateSchema = z.object({
  status: z.enum(BOOKING_STATUSES).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const listingUpdateSchema = z.object({
  status: z.enum(LISTING_STATUSES),
});

export const phoneForSaleSchema = z.object({
  brand: z.string().trim().min(1).max(50),
  model: z.string().trim().min(1).max(80),
  price: z.coerce.number().positive().max(10000),
  condition: z.enum(CONDITIONS),
  storage: z.string().trim().min(1).max(30),
  color: z.string().trim().min(1).max(40),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  description: z.string().trim().max(2000).optional(),
  images: z.array(z.string().max(500)).max(8).default([]),
  status: z.enum(PHONE_STATUSES).default("AVAILABLE"),
});

export const phoneForSaleUpdateSchema = phoneForSaleSchema.partial();

export const availableDaySchema = z.object({
  date: dateOnly,
  note: z.string().trim().max(200).optional(),
  isActive: z.boolean().default(true),
});

export const slotsUpdateSchema = z.object({
  slots: z.array(timeSlot).min(1, "Keep at least one time slot").max(48),
});

export const checkoutSchema = z.object({
  bookingId: z.string().min(1),
});

export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
export type RepairBookingInput = z.infer<typeof repairBookingSchema>;
export type PurchaseBookingInput = z.infer<typeof purchaseBookingSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
export type PhoneForSaleInput = z.infer<typeof phoneForSaleSchema>;
