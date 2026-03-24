"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, deleteMartyr, getAdminMartyrs, updateMartyr } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { MartyrListItem } from "@/lib/types";
import { formatArabicDate } from "@/lib/utils";

export default function AdminMartyrsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [items, setItems] = useState<MartyrListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData(currentToken: string) {
    setLoading(true);
    setError("");

    try {
      const payload = await getAdminMartyrs(currentToken, {
        page_size: 100,
        sort: "newest"
      });
      setItems(payload.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذر تحميل السجلات");
    } finally {
      setLoading(false);
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

  async function toggleFlag(item: MartyrListItem, field: "is_published" | "is_featured") {
    if (!token) return;

    try {
      const payload = new FormData();
      payload.set(field, String(!item[field]));
      await updateMartyr(token, item.id, payload);
      await loadData(token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "فشل تحديث السجل");
    }
  }

  async function onDelete(item: MartyrListItem) {
    if (!token) return;
    if (!window.confirm(`حذف سجل ${item.full_name}؟`)) return;

    try {
      await deleteMartyr(token, item.id);
      await loadData(token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "فشل حذف السجل");
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-stone bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">إدارة الشهداء</h1>
        <Link href="/admin/martyrs/new" className="rounded-lg bg-accent px-4 py-2 text-sm text-white">
          إضافة سجل
        </Link>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {loading ? (
        <div className="h-52 animate-pulse rounded-xl bg-stone/60" />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-right text-sm">
            <thead>
              <tr className="border-b border-stone text-muted">
                <th className="px-2 py-2">الاسم</th>
                <th className="px-2 py-2">القرية أو البلدة</th>
                <th className="px-2 py-2">التاريخ</th>
                <th className="px-2 py-2">النشر</th>
                <th className="px-2 py-2">مميز</th>
                <th className="px-2 py-2">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-stone/70">
                  <td className="px-2 py-3 font-medium text-ink">{item.full_name}</td>
                  <td className="px-2 py-3 text-muted">{item.village.name_ar}</td>
                  <td className="px-2 py-3 text-muted">{formatArabicDate(item.martyrdom_date)}</td>
                  <td className="px-2 py-3 text-muted">{item.is_published ? "منشور" : "مسودة"}</td>
                  <td className="px-2 py-3 text-muted">{item.is_featured ? "نعم" : "لا"}</td>
                  <td className="px-2 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/martyrs/${item.id}/edit`}
                        className="rounded border border-stone px-2 py-1 text-xs"
                      >
                        تعديل
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleFlag(item, "is_published")}
                        className="rounded border border-stone px-2 py-1 text-xs"
                      >
                        {item.is_published ? "إلغاء النشر" : "نشر"}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFlag(item, "is_featured")}
                        className="rounded border border-stone px-2 py-1 text-xs"
                      >
                        {item.is_featured ? "إلغاء التمييز" : "تمييز"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
