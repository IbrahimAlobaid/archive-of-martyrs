"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, getSubmissions, reviewSubmission } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { Submission, SubmissionStatus } from "@/lib/types";
import { formatArabicDate } from "@/lib/utils";

const statuses: Array<{ value: SubmissionStatus; label: string }> = [
  { value: "pending", label: "قيد المراجعة" },
  { value: "reviewed", label: "تمت المراجعة" },
  { value: "approved", label: "مقبول" },
  { value: "rejected", label: "مرفوض" }
];

export function AdminSubmissionTable() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "">("");
  const [items, setItems] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData(currentToken: string, nextStatus?: SubmissionStatus) {
    setIsLoading(true);
    setError("");

    try {
      const response = await getSubmissions(currentToken, {
        status: nextStatus,
        page: 1
      });
      setItems(response.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذر تحميل المراجعات");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const adminToken = getAdminToken();
    if (!adminToken) {
      router.replace("/admin/login");
      return;
    }

    setToken(adminToken);
    loadData(adminToken);
  }, [router]);

  async function updateStatus(submissionId: number, status: SubmissionStatus) {
    if (!token) return;

    try {
      await reviewSubmission(token, submissionId, status);
      await loadData(token, statusFilter || undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذر تحديث الحالة");
    }
  }

  async function onChangeFilter(value: string) {
    const nextStatus = value as SubmissionStatus | "";
    setStatusFilter(nextStatus);
    if (!token) return;
    await loadData(token, nextStatus || undefined);
  }

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-stone/60" />;
  }

  return (
    <section className="space-y-4 rounded-2xl border border-stone bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">المراجعات الواردة</h1>
        <select
          value={statusFilter}
          onChange={(event) => onChangeFilter(event.target.value)}
          className="rounded-lg border border-stone px-3 py-2 text-sm"
        >
          <option value="">كل الحالات</option>
          {statuses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-right text-sm">
          <thead>
            <tr className="border-b border-stone text-muted">
              <th className="px-3 py-2">المرسل</th>
              <th className="px-3 py-2">الرسالة</th>
              <th className="px-3 py-2">التاريخ</th>
              <th className="px-3 py-2">الحالة</th>
              <th className="px-3 py-2">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-stone/70">
                <td className="px-3 py-3">
                  {item.submitter_name || "بدون اسم"}
                  {item.submitter_email ? <div className="text-xs text-muted">{item.submitter_email}</div> : null}
                </td>
                <td className="px-3 py-3 text-muted">{item.message}</td>
                <td className="px-3 py-3 text-muted">{formatArabicDate(item.created_at)}</td>
                <td className="px-3 py-3 text-muted">{item.status}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateStatus(item.id, "reviewed")}
                      className="rounded border border-stone px-2 py-1 text-xs"
                    >
                      مراجعة
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(item.id, "approved")}
                      className="rounded border border-stone px-2 py-1 text-xs"
                    >
                      قبول
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(item.id, "rejected")}
                      className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
                    >
                      رفض
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
