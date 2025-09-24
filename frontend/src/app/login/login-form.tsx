"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Input";

const COOKIE_NAME = "admin_token";

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("demo-admin-token");
  const [message, setMessage] = useState<string | null>(null);

  const redirect = searchParams.get("redirect") ?? "/admin";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${60 * 60 * 24}; secure`;
    setMessage("Session initialized. Redirecting...");
    setTimeout(() => {
      router.push(redirect);
    }, 500);
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Admin access</h1>
      <p className="mt-2 text-sm text-slate-500">
        Provide a JWT (or placeholder token during development) to access the admin area.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="token">
            JWT token
          </label>
          <Input
            id="token"
            name="token"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Continue to admin
        </Button>
      </form>
      {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
      <p className="mt-6 text-xs text-slate-400">
        This placeholder flow mimics a JWT guard. Integrate with the real authentication service and remove this helper page once ready.
      </p>
    </div>
  );
};