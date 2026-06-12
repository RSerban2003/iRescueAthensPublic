"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/cn";
import { REPAIR_CATALOG, REPAIR_ISSUES, type RepairIssueKey } from "@/lib/repair-catalog";
import { formatEUR, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Field";
import { Stepper } from "@/components/ui/Stepper";
import { BookingScheduler, type ScheduleResult } from "@/components/booking/BookingScheduler";

const STEPS = ["Brand", "Model", "Issues", "Schedule"];
const OTHER_BRAND = "Other";

const BRAND_LOGOS: Record<string, string> = {
  Apple: "/brands/apple.svg",
  Samsung: "/brands/samsung.svg",
  Xiaomi: "/brands/xiaomi.svg",
};

interface Confirmation {
  bookingId: string;
  date: string;
  timeSlot: string;
}

export function RepairFlow() {
  const [step, setStep] = useState(0);
  const [brand, setBrand] = useState<string | null>(null);
  const [customBrand, setCustomBrand] = useState("");
  const [model, setModel] = useState<string | null>(null);
  const [customModel, setCustomModel] = useState("");
  const [modelQuery, setModelQuery] = useState("");
  const [issues, setIssues] = useState<Set<RepairIssueKey>>(new Set());
  const [otherIssue, setOtherIssue] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const isOtherBrand = brand === OTHER_BRAND;
  const models = useMemo(() => (brand && !isOtherBrand ? REPAIR_CATALOG[brand] ?? [] : []), [brand, isOtherBrand]);
  const filteredModels = useMemo(
    () => models.filter((entry) => entry.model.toLowerCase().includes(modelQuery.toLowerCase())),
    [models, modelQuery]
  );
  const selectedPricing = useMemo(
    () => models.find((entry) => entry.model === model),
    [models, model]
  );

  const effectiveBrand = isOtherBrand ? customBrand.trim() : brand ?? "";
  const effectiveModel = isOtherBrand ? customModel.trim() : model ?? "";

  const { total, hasUnpriced } = useMemo(() => {
    let sum = 0;
    let unpriced = false;
    for (const key of issues) {
      if (key === "other") {
        unpriced = true;
        continue;
      }
      const price = selectedPricing?.prices[key];
      if (typeof price === "number") sum += price;
      else unpriced = true;
    }
    return { total: sum, hasUnpriced: unpriced };
  }, [issues, selectedPricing]);

  const issueLabels = useMemo(
    () =>
      [...issues].map((key) => {
        if (key === "other") {
          return otherIssue.trim() ? `Other: ${otherIssue.trim()}` : "Other issue";
        }
        return REPAIR_ISSUES.find((issue) => issue.key === key)?.label ?? key;
      }),
    [issues, otherIssue]
  );

  const toggleIssue = (key: RepairIssueKey) => {
    setIssues((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const submitBooking = async ({ date, timeSlot, contact, notes }: ScheduleResult) => {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand: effectiveBrand,
        model: effectiveModel,
        issues: issueLabels,
        date,
        timeSlot,
        contact,
        notes,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(data.error ?? "Something went wrong — please try again.");
      return;
    }

    setConfirmation({ bookingId: data.bookingId, date, timeSlot });
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
        <h2 className="font-display text-2xl font-bold text-slate-900">Booking confirmed</h2>
        <p className="mt-2 text-slate-500">
          {effectiveBrand} {effectiveModel} — {issueLabels.join(", ")}
        </p>
        <p className="mt-1 font-medium text-slate-700">
          {formatDate(confirmation.date)} at {confirmation.timeSlot}
        </p>
        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Reference <span className="font-mono font-semibold text-slate-700">{confirmation.bookingId}</span>
          <br />
          We&apos;ve been notified and will have everything ready when you arrive.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button href="/" variant="outline">
            Back to home
          </Button>
          <Button href="/purchase">Browse refurbished phones</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Stepper steps={STEPS} current={step} />

      {/* Step 1 — brand */}
      {step === 0 && (
        <section aria-label="Choose your phone brand">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Object.keys(REPAIR_CATALOG), OTHER_BRAND].map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => {
                  setBrand(entry);
                  setModel(null);
                  setStep(1);
                }}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-xl border bg-white p-6 transition-all hover:border-brand-400 hover:shadow-card-hover",
                  brand === entry ? "border-brand-500 ring-2 ring-brand-200" : "border-slate-200"
                )}
              >
                {BRAND_LOGOS[entry] ? (
                  <Image src={BRAND_LOGOS[entry]} alt="" width={48} height={48} className="h-12 w-12 object-contain" />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" d="M12 5v14m-7-7h14" />
                    </svg>
                  </span>
                )}
                <span className="font-medium text-slate-800">{entry}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Step 2 — model */}
      {step === 1 && brand && (
        <section aria-label="Choose your phone model" className="max-w-2xl space-y-4">
          {isOtherBrand ? (
            <>
              <Input
                label="Brand"
                required
                value={customBrand}
                onChange={(event) => setCustomBrand(event.target.value)}
                placeholder="e.g. Google, OnePlus, Huawei…"
              />
              <Input
                label="Model"
                required
                value={customModel}
                onChange={(event) => setCustomModel(event.target.value)}
                placeholder="e.g. Pixel 8 Pro"
                hint="We'll confirm the exact price when you drop the phone off."
              />
            </>
          ) : (
            <>
              <Input
                label="Search models"
                value={modelQuery}
                onChange={(event) => setModelQuery(event.target.value)}
                placeholder={`Search ${brand} models…`}
              />
              <ul className="grid max-h-96 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {filteredModels.map((entry) => (
                  <li key={entry.model}>
                    <button
                      type="button"
                      onClick={() => {
                        setModel(entry.model);
                        setStep(2);
                      }}
                      className={cn(
                        "w-full rounded-lg border bg-white px-4 py-3 text-left text-sm font-medium transition-colors hover:border-brand-400",
                        model === entry.model
                          ? "border-brand-500 ring-2 ring-brand-200"
                          : "border-slate-200 text-slate-700"
                      )}
                    >
                      {entry.model}
                    </button>
                  </li>
                ))}
                {filteredModels.length === 0 && (
                  <li className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500 sm:col-span-2">
                    No models match “{modelQuery}”. Pick “Other” on the previous step to enter it
                    manually.
                  </li>
                )}
              </ul>
            </>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setStep(0)}>
              ← Back
            </Button>
            {isOtherBrand && (
              <Button
                onClick={() => setStep(2)}
                disabled={!customBrand.trim() || !customModel.trim()}
              >
                Continue
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Step 3 — issues */}
      {step === 2 && (
        <section aria-label="What needs fixing?" className="max-w-2xl space-y-4">
          <fieldset className="space-y-2">
            <legend className="sr-only">Select the problems with your device</legend>
            {REPAIR_ISSUES.map((issue) => {
              const price = issue.key === "other" ? undefined : selectedPricing?.prices[issue.key];
              const checked = issues.has(issue.key);
              return (
                <label
                  key={issue.key}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-4 rounded-xl border bg-white px-4 py-3 transition-colors",
                    checked ? "border-brand-500 ring-2 ring-brand-200" : "border-slate-200 hover:border-brand-300"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleIssue(issue.key)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="font-medium text-slate-800">{issue.label}</span>
                  </span>
                  <span className="text-sm font-semibold text-slate-600">
                    {typeof price === "number" ? formatEUR(price) : "Quote on inspection"}
                  </span>
                </label>
              );
            })}
          </fieldset>

          {issues.has("other") && (
            <Textarea
              label="Describe the issue"
              required
              value={otherIssue}
              onChange={(event) => setOtherIssue(event.target.value)}
              placeholder="Tell us what's happening with the device…"
            />
          )}

          {issues.size > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
              <span className="text-sm font-medium text-brand-900">
                Estimated total{hasUnpriced ? " (some items quoted in store)" : ""}
              </span>
              <span className="font-display text-xl font-bold text-brand-800">
                {total > 0 ? formatEUR(total) : "On request"}
                {total > 0 && hasUnpriced ? "+" : ""}
              </span>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={issues.size === 0 || (issues.has("other") && !otherIssue.trim())}
            >
              Continue to scheduling
            </Button>
          </div>
        </section>
      )}

      {/* Step 4 — schedule */}
      {step === 3 && (
        <section aria-label="Pick a time and leave your details" className="space-y-6">
          <BookingScheduler
            submitLabel="Confirm booking"
            summary={
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <p className="font-semibold text-slate-800">
                  {effectiveBrand} {effectiveModel}
                </p>
                <p className="mt-0.5 text-slate-500">{issueLabels.join(", ")}</p>
                <p className="mt-1 font-semibold text-brand-800">
                  {total > 0 ? `${formatEUR(total)}${hasUnpriced ? "+" : ""}` : "Price on inspection"}
                  <span className="ml-1 font-normal text-slate-400">· payable in store</span>
                </p>
              </div>
            }
            onSubmit={submitBooking}
          />
          <Button variant="ghost" onClick={() => setStep(2)}>
            ← Back to issues
          </Button>
        </section>
      )}
    </div>
  );
}
