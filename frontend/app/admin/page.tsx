"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, getAdminMartyrs, getMartyrStats, getSubmissions } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

type DashboardStats = {
  allMartyrs: number;
  publishedMartyrs: number;
  pendingSubmissions: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    allMartyrs: 0,
    publishedMartyrs: 0,
    pendingSubmissions: 0
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const currentToken = token;

    async function loadDashboard() {
      try {
        const [martyrs, publicStats, submissions] = await Promise.all([
          getAdminMartyrs(currentToken, { page_size: 100 }),
          getMartyrStats(),
          getSubmissions(currentToken, { status: "pending", page: 1 })
        ]);

        setStats({
          allMartyrs: martyrs.total,
          publishedMartyrs: publicStats.total_martyrs,
          pendingSubmissions: submissions.total
        });
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "تعذر تحميل لوحة التحكم");
      }
    }

    loadDashboard();
  }, [router]);

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold text-ink">لوحة التحكم</h1>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-stone bg-white p-5 shadow-soft">
          <p className="text-sm text-muted">إجمالي السجلات</p>
          <p className="text-3xl font-semibold text-ink">{stats.allMartyrs}</p>
        </article>
        <article className="rounded-2xl border border-stone bg-white p-5 shadow-soft">
          <p className="text-sm text-muted">المنشور للعامة</p>
          <p className="text-3xl font-semibold text-ink">{stats.publishedMartyrs}</p>
        </article>
        <article className="rounded-2xl border border-stone bg-white p-5 shadow-soft">
          <p className="text-sm text-muted">مراجعات قيد الانتظار</p>
          <p className="text-3xl font-semibold text-ink">{stats.pendingSubmissions}</p>
        </article>
      </div>
    </section>
  );
}
