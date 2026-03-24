"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, createVillage, getVillages } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { Village } from "@/lib/types";

export function AdminVillageManager() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [message, setMessage] = useState("");

  async function loadVillages() {
    const payload = await getVillages();
    setVillages(payload);
  }

  useEffect(() => {
    const adminToken = getAdminToken();
    if (!adminToken) {
      router.replace("/admin/login");
      return;
    }

    setToken(adminToken);
    loadVillages();
  }, [router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setMessage("");

    try {
      await createVillage(token, {
        name_ar: nameAr,
        name_en: nameEn || undefined
      });

      setNameAr("");
      setNameEn("");
      await loadVillages();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر إنشاء القرية أو البلدة");
    }
  }

  return (
    <div className="space-y-5 rounded-2xl border border-stone bg-white p-6 shadow-soft">
      <h1 className="text-2xl font-semibold text-ink">إدارة القرى والبلدات</h1>

      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input
          value={nameAr}
          onChange={(event) => setNameAr(event.target.value)}
          placeholder="اسم القرية أو البلدة بالعربية"
          className="rounded-xl border border-stone px-3 py-2"
          required
        />
        <input
          value={nameEn}
          onChange={(event) => setNameEn(event.target.value)}
          placeholder="الاسم بالإنجليزية (اختياري)"
          className="rounded-xl border border-stone px-3 py-2"
        />
        <button type="submit" className="rounded-xl bg-accent px-4 py-2 text-sm text-white">
          إضافة
        </button>
      </form>

      {message ? <p className="text-sm text-red-700">{message}</p> : null}

      <ul className="grid gap-2 md:grid-cols-2">
        {villages.map((village) => (
          <li key={village.id} className="rounded-lg border border-stone px-3 py-2 text-sm">
            <span className="font-medium text-ink">{village.name_ar}</span>
            {village.name_en ? <span className="mr-2 text-muted">({village.name_en})</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
