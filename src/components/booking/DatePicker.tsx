"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface DatePickerProps {
  /** Bookable dates as YYYY-MM-DD keys. */
  availableDates: Set<string>;
  value: string | null;
  onChange: (dateKey: string) => void;
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Month-grid calendar that only enables the shop's open days. */
export function DatePicker({ availableDates, value, onChange }: DatePickerProps) {
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const grid = useMemo(() => {
    const firstDay = new Date(Date.UTC(view.year, view.month, 1));
    // Monday-first offset: getUTCDay() is 0 for Sunday.
    const offset = (firstDay.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate();
    const cells: Array<number | null> = Array.from({ length: offset }, () => null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(day);
    return cells;
  }, [view]);

  const moveMonth = (delta: number) => {
    setView(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => moveMonth(-1)}
          aria-label="Previous month"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02z" clipRule="evenodd" />
          </svg>
        </button>
        <p className="font-display text-sm font-semibold text-slate-900">
          {MONTHS[view.month]} {view.year}
        </p>
        <button
          type="button"
          onClick={() => moveMonth(1)}
          aria-label="Next month"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-label="Choose a date">
        {WEEKDAYS.map((day) => (
          <span key={day} className="py-1 text-xs font-semibold uppercase text-slate-400">
            {day}
          </span>
        ))}
        {grid.map((day, index) => {
          if (day === null) return <span key={`pad-${index}`} aria-hidden="true" />;
          const key = dateKey(view.year, view.month, day);
          const available = availableDates.has(key);
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              disabled={!available}
              onClick={() => onChange(key)}
              aria-pressed={selected}
              aria-label={key + (available ? "" : " (unavailable)")}
              className={cn(
                "h-9 rounded-lg text-sm font-medium transition-colors",
                selected
                  ? "bg-brand-600 text-white"
                  : available
                    ? "bg-brand-50 text-brand-800 hover:bg-brand-100"
                    : "cursor-default text-slate-300"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-slate-400">Highlighted days are open for appointments.</p>
    </div>
  );
}
