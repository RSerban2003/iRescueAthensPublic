"use client";

import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { listingSchema } from "@/lib/validation";
import { CONDITION_LABELS, formatEUR } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Stepper } from "@/components/ui/Stepper";

const STEPS = ["Device", "Photos & price", "Contact"];
const BRANDS = ["Apple", "Samsung", "Xiaomi", "Google", "Huawei", "OnePlus", "Other"];
const STORAGE_OPTIONS = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"];
const MAX_IMAGES = 5;

export function SellFlow() {
  const [step, setStep] = useState(0);
  const [device, setDevice] = useState({ brand: "", model: "", storage: "", condition: "" });
  const [details, setDetails] = useState({ askingPrice: "", description: "" });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [listingId, setListingId] = useState<string | null>(null);

  const uploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`You can add up to ${MAX_IMAGES} photos.`);
      return;
    }

    const form = new FormData();
    for (const file of Array.from(files)) form.append("files", file);

    setUploading(true);
    try {
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data.error ?? "Upload failed — please try again.");
        return;
      }
      setImages((current) => [...current, ...data.paths]);
    } catch {
      toast.error("Upload failed — please check your connection.");
    } finally {
      setUploading(false);
    }
  };

  const validateStep = (target: number): boolean => {
    const nextErrors: Record<string, string> = {};

    if (target >= 1) {
      if (!device.brand) nextErrors.brand = "Pick a brand";
      if (!device.model.trim()) nextErrors.model = "Enter the model";
      if (!device.storage) nextErrors.storage = "Pick the storage size";
      if (!device.condition) nextErrors.condition = "Pick the condition";
    }
    if (target >= 2) {
      const price = Number(details.askingPrice);
      if (!details.askingPrice || Number.isNaN(price) || price <= 0) {
        nextErrors.askingPrice = "Enter your asking price in euros";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      brand: device.brand,
      model: device.model.trim(),
      storage: device.storage,
      condition: device.condition,
      description: details.description.trim() || undefined,
      askingPrice: Number(details.askingPrice),
      images,
      contact,
    };

    const parsed = listingSchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".").replace("contact.", "");
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data.error ?? "Something went wrong — please try again.");
        return;
      }
      setListingId(data.listingId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  if (listingId) {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </span>
        <h2 className="font-display text-2xl font-bold text-slate-900">Request received</h2>
        <p className="mt-2 text-slate-500">
          {device.brand} {device.model} ({device.storage}) · asking {formatEUR(Number(details.askingPrice))}
        </p>
        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Reference <span className="font-mono font-semibold text-slate-700">{listingId}</span>
          <br />
          We&apos;ll review the details and email you an offer — usually within one business day.
        </p>
        <div className="mt-6">
          <Button href="/">Back to home</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <Stepper steps={STEPS} current={step} />

      {step === 0 && (
        <section aria-label="Describe your device" className="space-y-4">
          <Select
            label="Brand"
            required
            value={device.brand}
            error={errors.brand}
            onChange={(event) => setDevice({ ...device, brand: event.target.value })}
            placeholder="Choose a brand"
            options={BRANDS.map((value) => ({ value, label: value }))}
          />
          <Input
            label="Model"
            required
            value={device.model}
            error={errors.model}
            onChange={(event) => setDevice({ ...device, model: event.target.value })}
            placeholder="e.g. iPhone 13 Pro, Galaxy S22…"
          />
          <Select
            label="Storage"
            required
            value={device.storage}
            error={errors.storage}
            onChange={(event) => setDevice({ ...device, storage: event.target.value })}
            placeholder="Choose storage"
            options={STORAGE_OPTIONS.map((value) => ({ value, label: value }))}
          />
          <Select
            label="Condition"
            required
            value={device.condition}
            error={errors.condition}
            onChange={(event) => setDevice({ ...device, condition: event.target.value })}
            placeholder="Be honest — we check in store"
            options={Object.entries(CONDITION_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <div className="flex justify-end pt-2">
            <Button onClick={() => validateStep(1) && setStep(1)}>Continue</Button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section aria-label="Photos and asking price" className="space-y-4">
          <Input
            label="Asking price (EUR)"
            required
            type="number"
            min="1"
            inputMode="numeric"
            value={details.askingPrice}
            error={errors.askingPrice}
            onChange={(event) => setDetails({ ...details, askingPrice: event.target.value })}
            hint="Your starting point — we'll confirm after inspecting the device."
          />
          <Textarea
            label="Anything we should know? (optional)"
            value={details.description}
            error={errors.description}
            onChange={(event) => setDetails({ ...details, description: event.target.value })}
            placeholder="Scratches, battery health, accessories included…"
          />

          <div className="space-y-1.5">
            <span className="block text-sm font-medium text-slate-700">
              Photos (optional, up to {MAX_IMAGES})
            </span>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 py-8 text-center hover:border-brand-400">
              <svg className="h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0z" />
              </svg>
              <span className="text-sm font-medium text-slate-600">
                {uploading ? "Uploading…" : "Click to add photos"}
              </span>
              <span className="text-xs text-slate-400">JPEG, PNG or WebP, max 4 MB each</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                disabled={uploading || images.length >= MAX_IMAGES}
                onChange={(event) => {
                  void uploadImages(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
            {images.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {images.map((image) => (
                  <li key={image} className="relative">
                    <Image
                      src={image}
                      alt="Uploaded photo of your phone"
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                    <button
                      type="button"
                      aria-label="Remove photo"
                      onClick={() => setImages(images.filter((entry) => entry !== image))}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-red-600"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setStep(0)}>
              ← Back
            </Button>
            <Button onClick={() => validateStep(2) && setStep(2)}>Continue</Button>
          </div>
        </section>
      )}

      {step === 2 && (
        <form onSubmit={submit} noValidate aria-label="Your contact details" className="space-y-4">
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
            onChange={(event) => setContact({ ...contact, phone: event.target.value })}
          />

          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <p className="font-semibold text-slate-800">
              {device.brand} {device.model} ({device.storage})
            </p>
            <p className="mt-0.5 text-slate-500">
              {CONDITION_LABELS[device.condition] ?? device.condition} · asking{" "}
              {details.askingPrice ? formatEUR(Number(details.askingPrice)) : "—"} ·{" "}
              {images.length} photo{images.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button type="submit" loading={submitting}>
              Submit request
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
