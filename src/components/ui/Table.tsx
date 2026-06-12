import { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Table({ className, ...rest }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
      <table className={cn("w-full text-left text-sm", className)} {...rest} />
    </div>
  );
}

export function THead({ className, ...rest }: ComponentProps<"thead">) {
  return (
    <thead
      className={cn(
        "border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500",
        className
      )}
      {...rest}
    />
  );
}

export function TH({ className, ...rest }: ComponentProps<"th">) {
  return <th className={cn("px-4 py-3", className)} {...rest} />;
}

export function TBody({ className, ...rest }: ComponentProps<"tbody">) {
  return <tbody className={cn("divide-y divide-slate-100", className)} {...rest} />;
}

export function TR({ className, ...rest }: ComponentProps<"tr">) {
  return <tr className={cn("hover:bg-slate-50/60", className)} {...rest} />;
}

export function TD({ className, ...rest }: ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-middle text-slate-700", className)} {...rest} />;
}
