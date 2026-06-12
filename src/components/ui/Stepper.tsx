import { Fragment } from "react";
import { cn } from "@/lib/cn";

interface StepperProps {
  steps: string[];
  /** Zero-based index of the active step. */
  current: number;
}

/** Horizontal step indicator for multi-step flows. */
export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {steps.map((step, index) => {
        const state = index < current ? "done" : index === current ? "active" : "todo";
        return (
          <Fragment key={step}>
            {index > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  "h-px flex-1 transition-colors",
                  index <= current ? "bg-brand-500" : "bg-slate-200"
                )}
              />
            )}
            <li
              className="flex items-center gap-2"
              aria-current={state === "active" ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  state === "done" && "bg-brand-600 text-white",
                  state === "active" && "bg-brand-600 text-white ring-4 ring-brand-100",
                  state === "todo" && "bg-slate-200 text-slate-500"
                )}
              >
                {state === "done" ? (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:block",
                  state === "active" ? "text-slate-900" : "text-slate-500"
                )}
              >
                {step}
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
