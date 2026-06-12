"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { contactMessageSchema } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "" };

export function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof EMPTY) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: event.target.value });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = contactMessageSchema.safeParse(form);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error ?? "Failed to send — please try again.");
        return;
      }
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="py-10 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </span>
        <h2 className="font-display text-xl font-semibold text-slate-900">Message sent</h2>
        <p className="mt-2 text-sm text-slate-500">
          Thanks for reaching out — we&apos;ll reply to {form.email} shortly.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setForm(EMPTY);
            setSent(false);
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" required autoComplete="name" value={form.name} error={errors.name} onChange={set("name")} />
        <Input label="Email" type="email" required autoComplete="email" value={form.email} error={errors.email} onChange={set("email")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Phone (optional)" type="tel" autoComplete="tel" value={form.phone} error={errors.phone} onChange={set("phone")} />
        <Input label="Subject" required value={form.subject} error={errors.subject} onChange={set("subject")} />
      </div>
      <Textarea label="Message" required rows={6} value={form.message} error={errors.message} onChange={set("message")} />
      <Button type="submit" loading={submitting}>
        Send message
      </Button>
    </form>
  );
}
