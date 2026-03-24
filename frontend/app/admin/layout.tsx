"use client";

import { usePathname } from "next/navigation";

import { AdminSidebar } from "@/components/admin/AdminSidebar";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <div className="mx-auto max-w-md py-10">{children}</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <AdminSidebar />
      <div>{children}</div>
    </div>
  );
}
