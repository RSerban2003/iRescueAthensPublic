"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { contactInfoSchema, type ContactInfo } from "@/lib/validation";
import { DatePicker } from "@/components/booking/DatePicker";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";

export interface ScheduleResult {
  date: string;
  timeSlot: string;
  contact: ContactInfo;
  notes?: string;
}

interface AvailabilityResponse {
  days: Array<{ date: string; note: string | null }>;
  slots: string[];
  booked: Record<string, string[]>;
}

interface BookingSchedulerProps {
  /** Called with the completed schedule; reject/throw to keep the form active. */
  onSubmit: (result: ScheduleResult) => Promise<void>;
  submitLabel: string;
  /** Optional summary block rendered above the submit button. */
  summary?: React.ReactNode;
}

/**
 * Shared appointment form: open-day calendar, free time slots, and contact
 * details with inline validation. Used by the repair and purchase flows.
 */
export function BookingScheduler({ onSubmit, submitLabel, summary }: BookingSchedulerProps) {
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [timeSlot, setTimeSlot] = useState<string | null>(null);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/availability")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("availability failed"))))
      .then((data: AvailabilityResponse) => {
        if (!cancelled) setAvailability(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const availableDates = useMemo(
    () => new Set(availability?.days.map((day) => day.date) ?? []),
    [availability]
  );

  const freeSlots = useMemo(() => {
    if (!availability || !date) return [];
    const taken = new Set(availability.booked[date] ?? []);
    return availability.slots.map((slot) => ({ slot, taken: taken.has(slot) }));
  }, [availability, date]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!date) nextErrors.date = "Pick a day for your visit";
    if (!timeSlot) nextErrors.timeSlot = "Pick a time slot";

    const parsedContact = contactInfoSchema.safeParse(contact);
    if (!parsedContact.success) {
      for (const issue of parsedContact.error.issues) {
        const key = issue.path.join(".");
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !parsedContact.success || !date || !timeSlot) return;

    setSubmitting(true);
    try {
      await onSubmit({
        date,
        timeSlot,
        contact: parsedContact.data,
        notes: notes.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700" role="alert">
        We couldn&apos;t load the appointment calendar. Please refresh the page or{" "}
        <a href="/contact" className="font-semibold underline">
          contact us
        </a>{" "}
        directly.
      </p>
    );
  }

  if (!availability) {
    return (
      <div className="grid gap-6 md:grid-cols-2" aria-busy="true" aria-label="Loading availability">
        <Skeleton className="h-72" />
        <div className="space-y-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-700">
            Pick a day<span className="ml-0.5 text-red-500" aria-hidden="true">*</span>
          </h3>
          <DatePicker
            availableDates={availableDates}
            value={date}
            onChange={(value) => {
              setDate(value);
              setTimeSlot(null);
            }}
          />
          {errors.date && (
            <p className="mt-1.5 text-sm text-red-600" role="alert">
              {errors.date}
            </p>
          )}
        </div>

        {date && (
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700">
              Pick a time<span className="ml-0.5 text-red-500" aria-hidden="true">*</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {freeSlots.map(({ slot, taken }) => (
                <button
                  key={slot}
                  type="button"
                  disabled={taken}
                  onClick={() => setTimeSlot(slot)}
                  aria-pressed={timeSlot === slot}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    timeSlot === slot
                      ? "bg-brand-600 text-white"
                      : taken
                        ? "cursor-not-allowed bg-slate-100 text-slate-300 line-through"
                        : "bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-brand-50 hover:text-brand-800"
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
            {errors.timeSlot && (
              <p className="mt-1.5 text-sm text-red-600" role="alert">
                {errors.timeSlot}
              </p>
            )}
          </fieldset>
        )}
      </div>

      <div className="space-y-4">
        <Input
          label="Full name"
          required
          autoComplete="name"
          value={contact.name}
          error={errors.name}
          onChange={(event) => setContact({ ...contact, name: event.target.value })}
        />
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={contact.email}
          error={errors.email}
          onChange={(event) => setContact({ ...contact, email: event.target.value })}
        />
        <Input
          label="Phone"
          type="tel"
          required
          autoComplete="tel"
          value={contact.phone}
          error={errors.phone}
          hint="We only call about this appointment."
          onChange={(event) => setContact({ ...contact, phone: event.target.value })}
        />
        <Textarea
          label="Notes (optional)"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Anything we should know in advance?"
        />

        {summary}

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
