"use client";

import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Input";
import { cn } from "@/lib/cn";
import { useState } from "react";

type TopbarProps = {
  className?: string;
};

export const Topbar = ({ className }: TopbarProps) => {
  const [search, setSearch] = useState("");

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="hidden lg:block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Admin Area
          </span>
          <p className="text-base font-semibold text-slate-900">Control Center</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="hidden w-full max-w-xs lg:block">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search admin content"
          />
        </div>
        <Button variant="secondary">Notifications</Button>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1">
          <span className="h-9 w-9 rounded-full bg-blue-600 text-center text-sm font-semibold leading-9 text-white">
            AD
          </span>
          <div className="hidden text-left text-sm leading-tight sm:block">
            <p className="font-semibold text-slate-900">Admin Demo</p>
            <p className="text-slate-500">admin@example.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};