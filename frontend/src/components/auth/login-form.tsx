"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Input";
import { useAuth } from "@/context/auth-context";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const LoginForm = () => {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const next = searchParams.get("next") ?? "/app";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parseResult = loginSchema.safeParse(form);
    if (!parseResult.success) {
      setError(parseResult.error.issues[0]?.message ?? "Invalid credentials.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(form.email, form.password);
      router.push(next);
    } catch {
      setError("Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
      <p className="mt-2 text-sm text-slate-500">Access the application using your credentials.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-sm text-slate-500">
        <Link className="hover:text-blue-600" href="/forgot-password">
          Forgot your password?
        </Link>
        <span>
          Need an account? {" "}
          <Link className="font-medium text-blue-600 hover:underline" href="/register">
            Register now
          </Link>
        </span>
      </div>
    </div>
  );
};

