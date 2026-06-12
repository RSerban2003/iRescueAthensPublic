import { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type CardProps = ComponentProps<"div"> & { hover?: boolean };

export function Card({ className, hover = false, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-card",
        hover && "transition-shadow hover:shadow-card-hover",
        className
      )}
      {...rest}
    />
  );
}
