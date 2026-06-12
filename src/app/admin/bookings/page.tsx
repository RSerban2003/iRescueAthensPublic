"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_TONES,
  formatDate,
  formatEUR,
} from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface BookingRow {
  id: string;
  type: "REPAIR" | "PURCHASE";
  status: string;
  date: string;
  timeSlot: string;
  name: string;
  email: string;
  phone: string;
  notes: string | null;
  brand: string | null;
  model: string | null;
  issues: string[];
  totalAmount: number | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
}

const STATUS_OPTIONS = Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [detail, setDetail] = useState<BookingRow | null>(null);

  useEffect(() => {
    fetch("/api/admin/bookings")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error())))
      .then((data) => setBookings(data.bookings))
      .catch(() => toast.error("Failed to load bookings."));
  }, []);

  const visible = useMemo(() => {
    if (!bookings) return [];
    return bookings
      .filter(
        (booking) =>
          (!statusFilter || booking.status === statusFilter) &&
          (!typeFilter || booking.type === typeFilter)
      )
      .sort((a, b) => {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortAsc ? diff : -diff;
      });
  }, [bookings, statusFilter, typeFilter, sortAsc]);

  const updateStatus = async (booking: BookingRow, status: string) => {
    const previous = bookings;
    setBookings(
      (current) =>
        current?.map((entry) => (entry.id === booking.id ? { ...entry, status } : entry)) ?? null
    );

    const response = await fetch(`/api/admin/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setBookings(previous ?? null);
      toast.error("Failed to update status.");
      return;
    }
    toast.success(`Booking ${BOOKING_STATUS_LABELS[status].toLowerCase()}.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-slate-900">Bookings</h1>
        <div className="flex flex-wrap gap-3">
          <Select
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            placeholder="All statuses"
            options={STATUS_OPTIONS}
            className="min-w-36"
          />
          <Select
            label="Type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            placeholder="All types"
            options={[
              { value: "REPAIR", label: "Repair" },
              { value: "PURCHASE", label: "Purchase" },
            ]}
            className="min-w-36"
          />
        </div>
      </div>

      {bookings === null ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          title={bookings.length === 0 ? "No bookings yet" : "Nothing matches these filters"}
          description={
            bookings.length === 0
              ? "Bookings made through the repair and purchase flows will appear here."
              : "Try clearing the status or type filter."
          }
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Customer</TH>
              <TH>Type</TH>
              <TH>Device</TH>
              <TH>
                <button
                  type="button"
                  onClick={() => setSortAsc((value) => !value)}
                  className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-slate-700"
                >
                  When
                  <span aria-hidden="true">{sortAsc ? "↑" : "↓"}</span>
                </button>
              </TH>
              <TH>Amount</TH>
              <TH>Status</TH>
              <TH>
                <span className="sr-only">Actions</span>
              </TH>
            </tr>
          </THead>
          <TBody>
            {visible.map((booking) => (
              <TR key={booking.id}>
                <TD>
                  <p className="font-medium text-slate-900">{booking.name}</p>
                  <p className="text-xs text-slate-400">{booking.phone}</p>
                </TD>
                <TD>{booking.type === "REPAIR" ? "Repair" : "Purchase"}</TD>
                <TD>
                  <p>
                    {booking.brand} {booking.model}
                  </p>
                  {booking.issues.length > 0 && (
                    <p className="max-w-48 truncate text-xs text-slate-400" title={booking.issues.join(", ")}>
                      {booking.issues.join(", ")}
                    </p>
                  )}
                </TD>
                <TD>
                  {formatDate(booking.date)}
                  <span className="text-slate-400"> · {booking.timeSlot}</span>
                </TD>
                <TD>
                  {booking.totalAmount ? formatEUR(booking.totalAmount) : "—"}
                  {booking.paymentStatus === "PAID" && (
                    <Badge tone="success" className="ml-1.5">
                      Paid
                    </Badge>
                  )}
                </TD>
                <TD>
                  <label className="sr-only" htmlFor={`status-${booking.id}`}>
                    Change status for {booking.name}
                  </label>
                  <select
                    id={`status-${booking.id}`}
                    value={booking.status}
                    onChange={(event) => updateStatus(booking, event.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </TD>
                <TD>
                  <button
                    type="button"
                    onClick={() => setDetail(booking)}
                    className="text-sm font-medium text-brand-700 hover:text-brand-800"
                  >
                    Details
                  </button>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail ? `Booking — ${detail.name}` : ""}
      >
        {detail && (
          <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              <dt className="text-slate-500">Status</dt>
              <dd>
                <Badge tone={BOOKING_STATUS_TONES[detail.status]}>
                  {BOOKING_STATUS_LABELS[detail.status]}
                </Badge>
              </dd>
              <dt className="text-slate-500">Type</dt>
              <dd className="font-medium text-slate-800">
                {detail.type === "REPAIR" ? "Repair" : "Purchase"}
              </dd>
              <dt className="text-slate-500">Device</dt>
              <dd className="font-medium text-slate-800">
                {detail.brand} {detail.model}
              </dd>
              {detail.issues.length > 0 && (
                <>
                  <dt className="text-slate-500">Issues</dt>
                  <dd className="font-medium text-slate-800">{detail.issues.join(", ")}</dd>
                </>
              )}
              <dt className="text-slate-500">When</dt>
              <dd className="font-medium text-slate-800">
                {formatDate(detail.date)} at {detail.timeSlot}
              </dd>
              <dt className="text-slate-500">Email</dt>
              <dd>
                <a href={`mailto:${detail.email}`} className="font-medium text-brand-700">
                  {detail.email}
                </a>
              </dd>
              <dt className="text-slate-500">Phone</dt>
              <dd>
                <a href={`tel:${detail.phone}`} className="font-medium text-brand-700">
                  {detail.phone}
                </a>
              </dd>
              {detail.totalAmount !== null && (
                <>
                  <dt className="text-slate-500">Amount</dt>
                  <dd className="font-medium text-slate-800">
                    {formatEUR(detail.totalAmount)}
                    {detail.paymentMethod && (
                      <span className="text-slate-400">
                        {" "}
                        · {detail.paymentMethod === "ONLINE" ? "online" : "in store"}
                        {detail.paymentStatus ? ` · ${detail.paymentStatus.toLowerCase()}` : ""}
                      </span>
                    )}
                  </dd>
                </>
              )}
            </dl>
            {detail.notes && (
              <div>
                <p className="text-slate-500">Notes</p>
                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-slate-700">
                  {detail.notes}
                </p>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
