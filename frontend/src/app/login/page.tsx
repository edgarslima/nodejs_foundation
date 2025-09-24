import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <Suspense fallback={<div className="text-sm text-slate-500">Loading form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}