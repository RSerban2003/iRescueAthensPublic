"use client";

import { ComponentProps, useId } from "react";
import { cn } from "@/lib/cn";

const fieldClasses = (error?: string) =>
  cn(
    "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400",
    "disabled:cursor-not-allowed disabled:bg-slate-50",
    error
      ? "border-red-400 focus-visible:ring-red-500"
      : "border-slate-300 hover:border-slate-400"
  );

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  id: string;
  children: React.ReactNode;
}

function FieldShell({ label, error, hint, required, id, children }: FieldShellProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required && (
          <span className="ml-0.5 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = { label: string; error?: string; hint?: string } & ComponentProps<"input">;

export function Input({ label, error, hint, required, className, id, ...rest }: InputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} id={fieldId}>
      <input
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(fieldClasses(error), className)}
        {...rest}
      />
    </FieldShell>
  );
}

type TextareaProps = { label: string; error?: string; hint?: string } & ComponentProps<"textarea">;

export function Textarea({ label, error, hint, required, className, id, ...rest }: TextareaProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} id={fieldId}>
      <textarea
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error)}
        rows={4}
        className={cn(fieldClasses(error), className)}
        {...rest}
      />
    </FieldShell>
  );
}

type SelectProps = {
  label: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
} & ComponentProps<"select">;

export function Select({
  label,
  error,
  hint,
  required,
  options,
  placeholder,
  className,
  id,
  ...rest
}: SelectProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} id={fieldId}>
      <select
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(fieldClasses(error), className)}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
