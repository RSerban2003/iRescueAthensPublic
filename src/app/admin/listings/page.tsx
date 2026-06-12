"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CONDITION_LABELS,
  LISTING_STATUS_LABELS,
  LISTING_STATUS_TONES,
  formatEUR,
  formatDate,
} from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";

interface ListingRow {
  id: string;
  brand: string;
  model: string;
  storage: string;
  condition: string;
  description: string | null;
  askingPrice: number;
  images: string[];
  status: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<ListingRow[] | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [detail, setDetail] = useState<ListingRow | null>(null);

  useEffect(() => {
    fetch("/api/admin/listings")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error())))
      .then((data) => setListings(data.listings))
      .catch(() => toast.error("Failed to load sell requests."));
  }, []);

  const visible = useMemo(
    () => (listings ?? []).filter((listing) => !statusFilter || listing.status === statusFilter),
    [listings, statusFilter]
  );

  const updateStatus = async (listing: ListingRow, status: string) => {
    const response = await fetch(`/api/admin/listings/${listing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      toast.error("Failed to update the request.");
      return;
    }
    setListings(
      (current) =>
        current?.map((entry) => (entry.id === listing.id ? { ...entry, status } : entry)) ?? null
    );
    setDetail((current) => (current?.id === listing.id ? { ...current, status } : current));
    toast.success(`Marked as ${LISTING_STATUS_LABELS[status].toLowerCase()}.`);
  };

  const remove = async (listing: ListingRow) => {
    if (!window.confirm(`Delete the request for ${listing.brand} ${listing.model}?`)) return;
    const response = await fetch(`/api/admin/listings/${listing.id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Failed to delete the request.");
      return;
    }
    setListings((current) => current?.filter((entry) => entry.id !== listing.id) ?? null);
    setDetail(null);
    toast.success("Request deleted.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-slate-900">Sell requests</h1>
        <Select
          label="Status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          placeholder="All statuses"
          options={Object.entries(LISTING_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          className="min-w-40"
        />
      </div>

      {listings === null ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          title={listings.length === 0 ? "No sell requests yet" : "Nothing matches this filter"}
          description={
            listings.length === 0
              ? "When customers offer their phones through the sell flow, they land here for review."
              : "Try clearing the status filter."
          }
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Device</TH>
              <TH>Condition</TH>
              <TH>Asking</TH>
              <TH>Seller</TH>
              <TH>Received</TH>
              <TH>Status</TH>
              <TH>
                <span className="sr-only">Actions</span>
              </TH>
            </tr>
          </THead>
          <TBody>
            {visible.map((listing) => (
              <TR key={listing.id}>
                <TD>
                  <p className="font-medium text-slate-900">
                    {listing.brand} {listing.model}
                  </p>
                  <p className="text-xs text-slate-400">{listing.storage}</p>
                </TD>
                <TD>{CONDITION_LABELS[listing.condition] ?? listing.condition}</TD>
                <TD className="font-medium">{formatEUR(listing.askingPrice)}</TD>
                <TD>
                  <p>{listing.name}</p>
                  <p className="text-xs text-slate-400">{listing.phone}</p>
                </TD>
                <TD>{formatDate(listing.createdAt)}</TD>
                <TD>
                  <Badge tone={LISTING_STATUS_TONES[listing.status]}>
                    {LISTING_STATUS_LABELS[listing.status]}
                  </Badge>
                </TD>
                <TD>
                  <button
                    type="button"
                    onClick={() => setDetail(listing)}
                    className="text-sm font-medium text-brand-700 hover:text-brand-800"
                  >
                    Review
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
        title={detail ? `${detail.brand} ${detail.model} (${detail.storage})` : ""}
        size="lg"
      >
        {detail && (
          <div className="space-y-4 text-sm">
            {detail.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {detail.images.map((image) => (
                  <a key={image} href={image} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={image}
                      alt={`Photo of ${detail.brand} ${detail.model}`}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                  </a>
                ))}
              </div>
            )}

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              <dt className="text-slate-500">Condition</dt>
              <dd className="font-medium text-slate-800">
                {CONDITION_LABELS[detail.condition] ?? detail.condition}
              </dd>
              <dt className="text-slate-500">Asking price</dt>
              <dd className="font-medium text-slate-800">{formatEUR(detail.askingPrice)}</dd>
              <dt className="text-slate-500">Seller</dt>
              <dd className="font-medium text-slate-800">{detail.name}</dd>
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
            </dl>

            {detail.description && (
              <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-slate-700">
                {detail.description}
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button variant="danger" size="sm" onClick={() => remove(detail)}>
                Delete
              </Button>
              {detail.status === "PENDING" && (
                <>
                  <Button variant="outline" size="sm" onClick={() => updateStatus(detail, "REJECTED")}>
                    Decline
                  </Button>
                  <Button size="sm" onClick={() => updateStatus(detail, "APPROVED")}>
                    Make offer
                  </Button>
                </>
              )}
              {detail.status === "APPROVED" && (
                <Button size="sm" onClick={() => updateStatus(detail, "SOLD")}>
                  Mark as bought
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
