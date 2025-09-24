import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export const Card = ({ title, description, actions, children, className }: CardProps) => (
  <section className={cn("rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
    {(title || actions) && (
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <div className="space-y-1">
          {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    )}
    <div className="px-6 py-5">{children}</div>
  </section>
);