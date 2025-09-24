"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV, type AdminNavItem } from "@/config/adminNav";
import { cn } from "@/lib/cn";

const flattenNav = (items: AdminNavItem[]): AdminNavItem[] => {
  return items.flatMap((item) => [item, ...(item.children ? flattenNav(item.children) : [])]);
};

const NAV_LOOKUP = flattenNav(ADMIN_NAV);

const humanize = (value: string): string => {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

type BreadcrumbsProps = {
  className?: string;
};

export const Breadcrumbs = ({ className }: BreadcrumbsProps) => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const matched = NAV_LOOKUP.find((item) => item.href === href);
    return {
      href,
      label: matched?.label ?? humanize(segment),
      isCurrent: index === segments.length - 1,
    };
  });

  return (
    <nav className={cn("flex items-center gap-2 text-sm text-slate-500", className)} aria-label="Breadcrumb">
      <Link href="/admin" className="hover:text-slate-900">
        Admin
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-2">
          <span aria-hidden className="text-slate-300">/</span>
          {crumb.isCurrent ? (
            <span className="font-medium text-slate-900">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-slate-900">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
};