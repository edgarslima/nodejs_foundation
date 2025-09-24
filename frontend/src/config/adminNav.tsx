import type { FC, SVGProps } from "react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon?: FC<SVGProps<SVGSVGElement>>;
  roles?: Array<"ADMIN" | "USER">;
  children?: AdminNavItem[];
};

const DashboardIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    {...props}
    className={`h-5 w-5 ${props.className ?? ""}`.trim()}
  >
    <path
      d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z"
      fill="currentColor"
    />
  </svg>
);

const ChannelsIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    {...props}
    className={`h-5 w-5 ${props.className ?? ""}`.trim()}
  >
    <path
      d="M12 3a9 9 0 1 0 9 9 9.01 9.01 0 0 0-9-9Zm0 16a7 7 0 1 1 7-7 7 7 0 0 1-7 7Zm-.5-10h1a1 1 0 0 1 1 1v4.5a.5.5 0 0 1-1 0V10h-.5a.5.5 0 0 1 0-1ZM12 15.75a.75.75 0 1 1 .75-.75.75.75 0 0 1-.75.75Z"
      fill="currentColor"
    />
  </svg>
);

export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: DashboardIcon },
  { label: "Channels", href: "/admin/channels", icon: ChannelsIcon },
];