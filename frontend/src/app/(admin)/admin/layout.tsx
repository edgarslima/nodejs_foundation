import type { ReactNode } from "react";
import Script from "next/script";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { isAdminUiUsingCdn } from "@/lib/admin-ui-env";

const CDN_SCRIPT = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";

const tailwindInlineConfig = `tailwind.config = {
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5f5',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        }
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular']
      },
      container: {
        center: true,
        padding: '1.5rem'
      }
    }
  },
  darkMode: 'class'
};`;

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const useCdn = isAdminUiUsingCdn();

  return (
    <>
      {useCdn && (
        <>
          <Script src={CDN_SCRIPT} strategy="beforeInteractive" />
          <Script id="admin-tailwind-config" strategy="beforeInteractive">
            {tailwindInlineConfig}
          </Script>
        </>
      )}
      <div className="min-h-screen bg-slate-100">
        <div className="mx-auto flex min-h-screen max-w-[1440px]">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <Topbar />
            <div className="flex-1 space-y-6 px-4 py-6 lg:px-8">
              <Breadcrumbs />
              <main className="space-y-6">{children}</main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}