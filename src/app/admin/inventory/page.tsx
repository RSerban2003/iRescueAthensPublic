"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  CONDITION_LABELS,
  PHONE_STATUS_LABELS,
  PHONE_STATUS_TONES,
  formatEUR,
} from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";

interface PhoneRow {
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
  status: string;
}

interface FormState {
  brand: string;
  model: string;
  price: string;
  condition: string;
  storage: string;
  color: string;
  year: string;
  description: string;
  images: string[];
  status: string;
}

const EMPTY_FORM: FormState = {
  brand: "",
  model: "",
  price: "",
  condition: "GOOD",
  storage: "",
  color: "",
  year: "",
  description: "",
  images: [],
  status: "AVAILABLE",
};

const PLACEHOLDER = "/images/phone-placeholder.svg";

export default function AdminInventoryPage() {
  const [phones, setPhones] = useState<PhoneRow[] | null>(null);
  const [editing, setEditing] = useState<PhoneRow | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/phones")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error())))
      .then((data) => setPhones(data.phones))
      .catch(() => toast.error("Failed to load inventory."));
  }, []);

  const openEditor = (phone: PhoneRow | "new") => {
    setEditing(phone);
    setForm(
      phone === "new"
        ? EMPTY_FORM
        : {
            brand: phone.brand,
            model: phone.model,
            price: String(phone.price),
            condition: phone.condition,
            storage: phone.storage,
            color: phone.color,
            year: phone.year ? String(phone.year) : "",
            description: phone.description ?? "",
            images: phone.images,
            status: phone.status,
          }
    );
  };

  const uploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const body = new FormData();
    for (const file of Array.from(files)) body.append("files", file);

    setUploading(true);
    try {
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data.error ?? "Upload failed.");
        return;
      }
      setForm((current) => ({ ...current, images: [...current.images, ...data.paths] }));
    } finally {
      setUploading(false);
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      price: Number(form.price),
      condition: form.condition,
      storage: form.storage.trim(),
      color: form.color.trim(),
      year: form.year ? Number(form.year) : undefined,
      description: form.description.trim() || undefined,
      images: form.images,
      status: form.status,
    };

    setSaving(true);
    try {
      const isNew = editing === "new";
      const response = await fetch(
        isNew ? "/api/admin/phones" : `/api/admin/phones/${(editing as PhoneRow).id}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const firstFieldError =
          data.fieldErrors && Object.values<string>(data.fieldErrors)[0];
        toast.error(firstFieldError ?? data.error ?? "Failed to save the phone.");
        return;
      }

      setPhones((current) => {
        if (!current) return current;
        return isNew
          ? [data.phone, ...current]
          : current.map((entry) => (entry.id === data.phone.id ? data.phone : entry));
      });
      setEditing(null);
      toast.success(isNew ? "Phone added to inventory." : "Phone updated.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (phone: PhoneRow) => {
    if (!window.confirm(`Delete ${phone.brand} ${phone.model} from inventory?`)) return;
    const response = await fetch(`/api/admin/phones/${phone.id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Failed to delete the phone.");
      return;
    }
    setPhones((current) => current?.filter((entry) => entry.id !== phone.id) ?? null);
    toast.success("Phone removed.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-slate-900">Inventory</h1>
        <Button onClick={() => openEditor("new")}>Add phone</Button>
      </div>

      {phones === null ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : phones.length === 0 ? (
        <EmptyState
          title="No phones in inventory"
          description="Add your first refurbished device — it will appear in the public store immediately."
          action={<Button onClick={() => openEditor("new")}>Add phone</Button>}
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Device</TH>
              <TH>Specs</TH>
              <TH>Condition</TH>
              <TH>Price</TH>
              <TH>Status</TH>
              <TH>
                <span className="sr-only">Actions</span>
              </TH>
            </tr>
          </THead>
          <TBody>
            {phones.map((phone) => (
              <TR key={phone.id}>
                <TD>
                  <div className="flex items-center gap-3">
                    <Image
                      src={phone.images[0] ?? PLACEHOLDER}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                    <p className="font-medium text-slate-900">
                      {phone.brand} {phone.model}
                    </p>
                  </div>
                </TD>
                <TD>
                  {phone.storage} · {phone.color}
                  {phone.year ? ` · ${phone.year}` : ""}
                </TD>
                <TD>{CONDITION_LABELS[phone.condition] ?? phone.condition}</TD>
                <TD className="font-medium">{formatEUR(phone.price)}</TD>
                <TD>
                  <Badge tone={PHONE_STATUS_TONES[phone.status]}>
                    {PHONE_STATUS_LABELS[phone.status]}
                  </Badge>
                </TD>
                <TD>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => openEditor(phone)}
                      className="text-sm font-medium text-brand-700 hover:text-brand-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(phone)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add phone" : "Edit phone"}
        size="lg"
      >
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Brand"
            required
            value={form.brand}
            onChange={(event) => setForm({ ...form, brand: event.target.value })}
          />
          <Input
            label="Model"
            required
            value={form.model}
            onChange={(event) => setForm({ ...form, model: event.target.value })}
          />
          <Input
            label="Price (EUR)"
            required
            type="number"
            min="1"
            step="0.01"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: event.target.value })}
          />
          <Select
            label="Condition"
            required
            value={form.condition}
            onChange={(event) => setForm({ ...form, condition: event.target.value })}
            options={Object.entries(CONDITION_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <Input
            label="Storage"
            required
            placeholder="e.g. 128 GB"
            value={form.storage}
            onChange={(event) => setForm({ ...form, storage: event.target.value })}
          />
          <Input
            label="Colour"
            required
            value={form.color}
            onChange={(event) => setForm({ ...form, color: event.target.value })}
          />
          <Input
            label="Year (optional)"
            type="number"
            min="2000"
            max="2100"
            value={form.year}
            onChange={(event) => setForm({ ...form, year: event.target.value })}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
            options={Object.entries(PHONE_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Description (optional)"
              rows={3}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Photos</span>
            <div className="flex flex-wrap items-center gap-2">
              {form.images.map((image) => (
                <span key={image} className="relative">
                  <Image
                    src={image}
                    alt=""
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() =>
                      setForm({ ...form, images: form.images.filter((entry) => entry !== image) })
                    }
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-red-600"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </span>
              ))}
              <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-brand-400 hover:text-brand-500">
                <span className="sr-only">{uploading ? "Uploading…" : "Add photos"}</span>
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" d="M12 5v14m-7-7h14" />
                </svg>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  disabled={uploading}
                  onChange={(event) => {
                    void uploadImages(event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving || uploading}>
              {editing === "new" ? "Add phone" : "Save changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
