"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { clearAdminToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "لوحة التحكم" },
  { href: "/admin/martyrs", label: "إدارة الشهداء" },
  { href: "/admin/submissions", label: "المراجعات الواردة" },
  { href: "/admin/villages", label: "إدارة القرى والبلدات" }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearAdminToken();
    router.replace("/admin/login");
  }

  return (
    <aside className="rounded-2xl border border-stone bg-white p-4 shadow-soft">
      <h2 className="mb-4 text-sm font-semibold text-muted">الإدارة</h2>
      <nav className="space-y-2" aria-label="روابط الإدارة">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm",
              pathname === link.href
                ? "bg-accent/10 text-accent"
                : "text-muted transition hover:bg-sand hover:text-ink"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        className="mt-5 w-full rounded-lg border border-stone px-3 py-2 text-sm text-muted"
      >
        تسجيل الخروج
      </button>
    </aside>
  );
}
