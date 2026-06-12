"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/cn";
import { formatEUR, formatDate, CONDITION_LABELS } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookingScheduler, type ScheduleResult } from "@/components/booking/BookingScheduler";

export interface PhoneDto {
  id: string;
  brand: string;
  model: string;
  price: number;
  condition: string;
  storage: string;
  color: string;
  year: number | null;
  description: string | null;
  images: string[];
}

const PLACEHOLDER = "/images/phone-placeholder.svg";

interface Confirmation {
  bookingId: string;
  date: string;
  timeSlot: string;
  phone: PhoneDto;
}

export function PurchaseCatalog({
  phones,
  stripeEnabled,
}: {
  phones: PhoneDto[];
  stripeEnabled: boolean;
}) {
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [detail, setDetail] = useState<PhoneDto | null>(null);
  const [buying, setBuying] = useState<PhoneDto | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "IN_STORE">("IN_STORE");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const brands = useMemo(() => [...new Set(phones.map((phone) => phone.brand))].sort(), [phones]);

  const filtered = useMemo(
    () =>
      phones.filter(
        (phone) =>
          (!brand || phone.brand === brand) &&
          (!condition || phone.condition === condition) &&
          (!maxPrice || phone.price <= Number(maxPrice))
      ),
    [phones, brand, condition, maxPrice]
  );

  const startPurchase = (phone: PhoneDto) => {
    setDetail(null);
    setPaymentMethod("IN_STORE");
    setBuying(phone);
  };

  const submitPurchase = async ({ date, timeSlot, contact, notes }: ScheduleResult) => {
    if (!buying) return;

    const response = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneId: buying.id, date, timeSlot, contact, notes, paymentMethod }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(data.error ?? "Something went wrong — please try again.");
      return;
    }

    if (data.checkoutUrl) {
      // Online payment: hand over to Stripe Checkout.
      window.location.assign(data.checkoutUrl);
      return;
    }

    setConfirmation({ bookingId: data.bookingId, date, timeSlot, phone: buying });
    setBuying(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (confirmation) {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </span>
        <h2 className="font-display text-2xl font-bold text-slate-900">Pickup reserved</h2>
        <p className="mt-2 text-slate-500">
          {confirmation.phone.brand} {confirmation.phone.model} ({confirmation.phone.storage},{" "}
          {confirmation.phone.color}) — {formatEUR(confirmation.phone.price)}
        </p>
        <p className="mt-1 font-medium text-slate-700">
          {formatDate(confirmation.date)} at {confirmation.timeSlot} · pay in store
        </p>
        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Reference <span className="font-mono font-semibold text-slate-700">{confirmation.bookingId}</span>
          <br />
          We&apos;ll hold the device for you until your appointment.
        </p>
        <div className="mt-6">
          <Button href="/">Back to home</Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3 lg:max-w-2xl">
        <Select
          label="Brand"
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
          placeholder="All brands"
          options={brands.map((value) => ({ value, label: value }))}
        />
        <Select
          label="Condition"
          value={condition}
          onChange={(event) => setCondition(event.target.value)}
          placeholder="Any condition"
          options={Object.entries(CONDITION_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <Select
          label="Max price"
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
          placeholder="Any price"
          options={["200", "300", "400", "600", "800"].map((value) => ({
            value,
            label: `Up to ${formatEUR(Number(value))}`,
          }))}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title={phones.length === 0 ? "No phones in stock right now" : "No phones match your filters"}
          description={
            phones.length === 0
              ? "New devices arrive every week — check back soon or tell us what you're looking for."
              : "Try removing a filter or two."
          }
          action={
            phones.length === 0 ? (
              <Button href="/contact" variant="outline">
                Ask about availability
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setBrand("");
                  setCondition("");
                  setMaxPrice("");
                }}
              >
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((phone) => (
            <li key={phone.id}>
              <Card hover className="flex h-full flex-col overflow-hidden">
                <button
                  type="button"
                  onClick={() => setDetail(phone)}
                  className="group block w-full"
                  aria-label={`View ${phone.brand} ${phone.model} details`}
                >
                  <div className="relative aspect-square bg-slate-100">
                    <Image
                      src={phone.images[0] ?? PLACEHOLDER}
                      alt={`${phone.brand} ${phone.model}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                </button>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {phone.brand} {phone.model}
                    </h3>
                    <Badge tone={phone.condition === "LIKE_NEW" ? "success" : "neutral"}>
                      {CONDITION_LABELS[phone.condition] ?? phone.condition}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {phone.storage} · {phone.color}
                    {phone.year ? ` · ${phone.year}` : ""}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="font-display text-xl font-bold text-slate-900">
                      {formatEUR(phone.price)}
                    </span>
                    <Button size="sm" onClick={() => startPurchase(phone)}>
                      Buy
                    </Button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* Detail modal */}
      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.brand} ${detail.model}` : ""}
        size="lg"
      >
        {detail && <PhoneDetail phone={detail} onBuy={() => startPurchase(detail)} />}
      </Modal>

      {/* Purchase modal */}
      <Modal
        open={buying !== null}
        onClose={() => setBuying(null)}
        title={buying ? `Reserve ${buying.brand} ${buying.model}` : ""}
        size="lg"
      >
        {buying && (
          <div className="space-y-6">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-slate-700">Payment</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3",
                    paymentMethod === "IN_STORE"
                      ? "border-brand-500 ring-2 ring-brand-200"
                      : "border-slate-200"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "IN_STORE"}
                    onChange={() => setPaymentMethod("IN_STORE")}
                    className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">Pay in store</span>
                    <span className="block text-xs text-slate-500">Card or cash at pickup</span>
                  </span>
                </label>
                <label
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3",
                    !stripeEnabled && "cursor-not-allowed opacity-50",
                    stripeEnabled && "cursor-pointer",
                    paymentMethod === "ONLINE"
                      ? "border-brand-500 ring-2 ring-brand-200"
                      : "border-slate-200"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    disabled={!stripeEnabled}
                    checked={paymentMethod === "ONLINE"}
                    onChange={() => setPaymentMethod("ONLINE")}
                    className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">Pay online now</span>
                    <span className="block text-xs text-slate-500">
                      {stripeEnabled ? "Secure card payment via Stripe" : "Currently unavailable"}
                    </span>
                  </span>
                </label>
              </div>
            </fieldset>

            <BookingScheduler
              submitLabel={
                paymentMethod === "ONLINE"
                  ? `Continue to payment — ${formatEUR(buying.price)}`
                  : `Reserve pickup — ${formatEUR(buying.price)}`
              }
              summary={
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                  <p className="font-semibold text-slate-800">
                    {buying.brand} {buying.model} ({buying.storage}, {buying.color})
                  </p>
                  <p className="mt-0.5 text-slate-500">
                    {CONDITION_LABELS[buying.condition] ?? buying.condition} ·{" "}
                    {formatEUR(buying.price)}
                  </p>
                </div>
              }
              onSubmit={submitPurchase}
            />
          </div>
        )}
      </Modal>
    </>
  );
}

function PhoneDetail({ phone, onBuy }: { phone: PhoneDto; onBuy: () => void }) {
  const [imageIndex, setImageIndex] = useState(0);
  const images = phone.images.length ? phone.images : [PLACEHOLDER];

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
          <Image
            src={images[imageIndex]}
            alt={`${phone.brand} ${phone.model} — photo ${imageIndex + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        {images.length > 1 && (
          <div className="mt-2 flex gap-2">
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setImageIndex(index)}
                aria-label={`Show photo ${index + 1}`}
                className={cn(
                  "relative h-14 w-14 overflow-hidden rounded-lg border-2",
                  index === imageIndex ? "border-brand-500" : "border-transparent"
                )}
              >
                <Image src={image} alt="" fill sizes="56px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-slate-500">Condition</dt>
          <dd className="font-medium text-slate-800">
            {CONDITION_LABELS[phone.condition] ?? phone.condition}
          </dd>
          <dt className="text-slate-500">Storage</dt>
          <dd className="font-medium text-slate-800">{phone.storage}</dd>
          <dt className="text-slate-500">Colour</dt>
          <dd className="font-medium text-slate-800">{phone.color}</dd>
          {phone.year && (
            <>
              <dt className="text-slate-500">Year</dt>
              <dd className="font-medium text-slate-800">{phone.year}</dd>
            </>
          )}
        </dl>
        {phone.description && (
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{phone.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="font-display text-2xl font-bold text-slate-900">
            {formatEUR(phone.price)}
          </span>
          <Button onClick={onBuy}>Reserve / buy</Button>
        </div>
      </div>
    </div>
  );
}
