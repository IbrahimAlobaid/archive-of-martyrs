import { Suspense } from "react";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-stone/60" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
