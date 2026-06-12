"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface DayRow {
  id: string;
  date: string;
  note: string | null;
  isActive: boolean;
}

export default function AdminAvailabilityPage() {
  const [days, setDays] = useState<DayRow[] | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newSlot, setNewSlot] = useState("");
  const [savingDay, setSavingDay] = useState(false);
  const [savingSlots, setSavingSlots] = useState(false);

  useEffect(() => {
    fetch("/api/admin/availability")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error())))
      .then((data) => {
        setDays(data.days);
        setSlots(data.slots);
      })
      .catch(() => toast.error("Failed to load availability."));
  }, []);

  const addDay = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newDate) {
      toast.error("Pick a date first.");
      return;
    }

    setSavingDay(true);
    try {
      const response = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newDate, note: newNote.trim() || undefined, isActive: true }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data.error ?? "Failed to add the day.");
        return;
      }
      setDays((current) => {
        const rest = (current ?? []).filter((entry) => entry.id !== data.day.id);
        return [...rest, data.day].sort((a, b) => a.date.localeCompare(b.date));
      });
      setNewDate("");
      setNewNote("");
      toast.success("Day saved.");
    } finally {
      setSavingDay(false);
    }
  };

  const toggleDay = async (day: DayRow) => {
    const response = await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: day.date, note: day.note ?? undefined, isActive: !day.isActive }),
    });
    if (!response.ok) {
      toast.error("Failed to update the day.");
      return;
    }
    setDays(
      (current) =>
        current?.map((entry) =>
          entry.id === day.id ? { ...entry, isActive: !day.isActive } : entry
        ) ?? null
    );
  };

  const removeDay = async (day: DayRow) => {
    const response = await fetch(`/api/admin/availability?id=${day.id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Failed to delete the day.");
      return;
    }
    setDays((current) => current?.filter((entry) => entry.id !== day.id) ?? null);
  };

  const saveSlots = async (nextSlots: string[]) => {
    setSavingSlots(true);
    try {
      const response = await fetch("/api/admin/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: nextSlots }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const firstFieldError =
          data.fieldErrors && Object.values<string>(data.fieldErrors)[0];
        toast.error(firstFieldError ?? data.error ?? "Failed to save slots.");
        return;
      }
      setSlots(data.slots);
      toast.success("Time slots updated.");
    } finally {
      setSavingSlots(false);
    }
  };

  const addSlot = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{2}:\d{2}$/.test(newSlot)) {
      toast.error("Use HH:MM format, e.g. 14:30.");
      return;
    }
    if (slots.includes(newSlot)) {
      toast.error("That slot already exists.");
      return;
    }
    void saveSlots([...slots, newSlot].sort());
    setNewSlot("");
  };

  if (days === null) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-slate-900">Availability</h1>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-slate-900">Open days</h2>
        <p className="mt-1 text-sm text-slate-500">
          Customers can only book appointments on days listed here and marked active.
        </p>

        <form onSubmit={addDay} className="mt-4 flex flex-wrap items-end gap-3">
          <Input
            label="Date"
            type="date"
            required
            value={newDate}
            onChange={(event) => setNewDate(event.target.value)}
            className="w-44"
          />
          <Input
            label="Note (optional)"
            value={newNote}
            onChange={(event) => setNewNote(event.target.value)}
            placeholder="e.g. short staffed"
            className="w-56"
          />
          <Button type="submit" loading={savingDay}>
            Add day
          </Button>
        </form>

        {days.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No open days configured"
              description="Add the days you accept appointments — the booking calendar is empty until you do."
            />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {days.map((day) => (
              <li key={day.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-slate-800">{formatDate(day.date)}</p>
                  {day.note && <p className="text-xs text-slate-400">{day.note}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={day.isActive ? "success" : "neutral"}>
                    {day.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => toggleDay(day)}>
                    {day.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeDay(day)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-slate-900">Time slots</h2>
        <p className="mt-1 text-sm text-slate-500">
          The bookable times offered on every open day. Each slot fits one appointment.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {slots.map((slot) => (
            <span
              key={slot}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
            >
              {slot}
              <button
                type="button"
                aria-label={`Remove ${slot} slot`}
                disabled={savingSlots || slots.length <= 1}
                onClick={() => void saveSlots(slots.filter((entry) => entry !== slot))}
                className="text-slate-400 hover:text-red-600 disabled:opacity-40"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </span>
          ))}
        </div>

        <form onSubmit={addSlot} className="mt-4 flex items-end gap-3">
          <Input
            label="Add slot"
            placeholder="HH:MM"
            value={newSlot}
            onChange={(event) => setNewSlot(event.target.value)}
            className="w-32"
          />
          <Button type="submit" variant="outline" loading={savingSlots}>
            Add slot
          </Button>
        </form>
      </Card>
    </div>
  );
}
