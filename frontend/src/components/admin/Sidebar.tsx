"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV, type AdminNavItem } from "@/config/adminNav";
import { cn } from "@/lib/cn";

type SidebarProps = {
  items?: AdminNavItem[];
};

const isActive = (pathname: string, href: string): boolean => {
  if (href === "/admin") {
    return pathname === href;
  }
  return pathname.startsWith(href);
};

export const Sidebar = ({ items = ADMIN_NAV }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 flex-shrink-0 border-r border-slate-200 bg-white px-4 py-6 lg:block">
      <div className="mb-8">
        <span className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
          Admin Panel
        </span>
        <p className="mt-2 text-lg font-semibold text-slate-900">NodeJS Foundation</p>
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {Icon && <Icon className={cn("h-5 w-5", active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};