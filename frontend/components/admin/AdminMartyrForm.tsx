"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ApiError,
  createMartyr,
  deleteGalleryImage,
  getVillages,
  getMartyrByIdAdmin,
  updateMartyr,
  uploadGalleryImage
} from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { Martyr, Village } from "@/lib/types";

type AdminMartyrFormProps = {
  martyrId?: number;
};

type FormState = {
  full_name: string;
  village_id: string;
  birth_date: string;
  martyrdom_date: string;
  age: string;
  short_bio: string;
  full_story: string;
  is_published: boolean;
  is_featured: boolean;
};

const initialState: FormState = {
  full_name: "",
  village_id: "",
  birth_date: "",
  martyrdom_date: "",
  age: "",
  short_bio: "",
  full_story: "",
  is_published: false,
  is_featured: false
};

function toDateInputValue(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function AdminMartyrForm({ martyrId }: AdminMartyrFormProps) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [martyr, setMartyr] = useState<Martyr | null>(null);
  const [formState, setFormState] = useState<FormState>(initialState);
  const [mainImage, setMainImage] = useState<File | null>(null);

  const [galleryImage, setGalleryImage] = useState<File | null>(null);
  const [galleryAltText, setGalleryAltText] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const isEditMode = Boolean(martyrId);

  const previewImage = useMemo(() => {
    if (mainImage) {
      return URL.createObjectURL(mainImage);
    }
    return martyr?.main_image_url || "/images/placeholder-martyr.svg";
  }, [mainImage, martyr?.main_image_url]);

  useEffect(() => {
    const adminToken = getAdminToken();
    if (!adminToken) {
      router.replace("/admin/login");
      return;
    }
    const currentToken = adminToken;
    setToken(currentToken);

    async function loadInitialData() {
      try {
        const villagesPayload = await getVillages();
        setVillages(villagesPayload);

        if (martyrId) {
          const martyrPayload = await getMartyrByIdAdmin(martyrId, currentToken);
          setMartyr(martyrPayload);
          setFormState({
            full_name: martyrPayload.full_name,
            village_id: String(martyrPayload.village.id),
            birth_date: toDateInputValue(martyrPayload.birth_date),
            martyrdom_date: toDateInputValue(martyrPayload.martyrdom_date),
            age: martyrPayload.age ? String(martyrPayload.age) : "",
            short_bio: martyrPayload.short_bio ?? "",
            full_story: martyrPayload.full_story ?? "",
            is_published: martyrPayload.is_published,
            is_featured: martyrPayload.is_featured
          });
        }
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "تعذر تحميل البيانات");
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [martyrId, router]);

  useEffect(() => {
    return () => {
      if (mainImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [mainImage, previewImage]);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function onMainImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setMainImage(file ?? null);
  }

  function buildFormData() {
    const payload = new FormData();
    payload.set("full_name", formState.full_name);
    payload.set("village_id", formState.village_id);
    payload.set("martyrdom_date", formState.martyrdom_date);
    payload.set("is_published", String(formState.is_published));
    payload.set("is_featured", String(formState.is_featured));

    if (formState.birth_date) payload.set("birth_date", formState.birth_date);
    if (formState.age) payload.set("age", formState.age);
    payload.set("short_bio", formState.short_bio);
    payload.set("full_story", formState.full_story);

    if (mainImage) {
      payload.set("main_image", mainImage);
    }

    return payload;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    if (!formState.full_name || !formState.village_id || !formState.martyrdom_date) {
      setMessage("يرجى تعبئة الحقول الإلزامية");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const payload = buildFormData();

      if (isEditMode && martyrId) {
        const updated = await updateMartyr(token, martyrId, payload);
        setMartyr(updated);
        setMessage("تم حفظ التعديلات بنجاح");
      } else {
        await createMartyr(token, payload);
        router.replace("/admin/martyrs");
      }
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "تعذر حفظ السجل");
    } finally {
      setSaving(false);
    }
  }

  async function refreshMartyr() {
    if (!token || !martyrId) return;
    const payload = await getMartyrByIdAdmin(martyrId, token);
    setMartyr(payload);
  }

  async function onUploadGallery() {
    if (!token || !martyrId || !galleryImage) return;
    setMessage("");

    try {
      const payload = new FormData();
      payload.set("image", galleryImage);
      if (galleryAltText) payload.set("alt_text", galleryAltText);
      await uploadGalleryImage(token, martyrId, payload);
      setGalleryImage(null);
      setGalleryAltText("");
      await refreshMartyr();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "فشل رفع الصورة");
    }
  }

  async function onDeleteGalleryImage(imageId: number) {
    if (!token || !martyrId) return;
    try {
      await deleteGalleryImage(token, martyrId, imageId);
      await refreshMartyr();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "فشل حذف الصورة");
    }
  }

  if (loading) {
    return <div className="h-72 animate-pulse rounded-2xl bg-stone/60" />;
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-stone bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink">
          {isEditMode ? "تعديل سجل الشهيد" : "إضافة سجل شهيد"}
        </h1>

        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <label className="mb-1 block text-sm text-muted">الاسم الكامل *</label>
            <input
              value={formState.full_name}
              onChange={(event) => setField("full_name", event.target.value)}
              className="w-full rounded-xl border border-stone px-3 py-2 outline-none focus:border-accent"
              required
            />
          </div>

          <div className="lg:col-span-6">
            <label className="mb-1 block text-sm text-muted">القرية أو البلدة *</label>
            <select
              value={formState.village_id}
              onChange={(event) => setField("village_id", event.target.value)}
              className="w-full rounded-xl border border-stone px-3 py-2 outline-none focus:border-accent"
              required
            >
              <option value="">اختر قرية أو بلدة</option>
              {villages.map((village) => (
                <option key={village.id} value={village.id}>
                  {village.name_ar}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-4">
            <label className="mb-1 block text-sm text-muted">تاريخ الاستشهاد *</label>
            <input
              type="date"
              value={formState.martyrdom_date}
              onChange={(event) => setField("martyrdom_date", event.target.value)}
              className="w-full rounded-xl border border-stone px-3 py-2 outline-none focus:border-accent"
              required
            />
          </div>

          <div className="lg:col-span-4">
            <label className="mb-1 block text-sm text-muted">تاريخ الميلاد</label>
            <input
              type="date"
              value={formState.birth_date}
              onChange={(event) => setField("birth_date", event.target.value)}
              className="w-full rounded-xl border border-stone px-3 py-2 outline-none focus:border-accent"
            />
          </div>

          <div className="lg:col-span-4">
            <label className="mb-1 block text-sm text-muted">العمر</label>
            <input
              type="number"
              min={0}
              max={120}
              value={formState.age}
              onChange={(event) => setField("age", event.target.value)}
              className="w-full rounded-xl border border-stone px-3 py-2 outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-2 rounded-xl border border-stone/80 bg-sand/40 p-3 lg:col-span-12">
            <label className="block text-sm text-muted">الصورة الرئيسية</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={onMainImageChange}
              className="block w-full rounded-xl border border-stone bg-white px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted">أقصى حجم 5MB. الصيغ المدعومة: JPG / PNG / WEBP</p>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">نبذة مختصرة</label>
          <textarea
            value={formState.short_bio}
            onChange={(event) => setField("short_bio", event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-stone px-3 py-2 outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">السيرة الكاملة</label>
          <textarea
            value={formState.full_story}
            onChange={(event) => setField("full_story", event.target.value)}
            rows={8}
            className="w-full rounded-xl border border-stone px-3 py-2 outline-none focus:border-accent"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={formState.is_published}
              onChange={(event) => setField("is_published", event.target.checked)}
            />
            منشور
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={formState.is_featured}
              onChange={(event) => setField("is_featured", event.target.checked)}
            />
            مميز
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-5 py-2 text-sm text-white disabled:opacity-60"
        >
          {saving ? "جارٍ الحفظ..." : isEditMode ? "حفظ التعديلات" : "إنشاء السجل"}
        </button>

        {message ? <p className="text-sm text-muted">{message}</p> : null}
      </form>

      <div className="space-y-6">
        <section className="rounded-2xl border border-stone bg-white p-4 shadow-soft">
          <h2 className="mb-3 text-base font-semibold text-ink">معاينة</h2>
          <div className="space-y-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-stone bg-stone/20">
              <Image
                src={previewImage}
                alt="معاينة الصورة"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 30vw"
              />
            </div>
            <h3 className="text-lg font-semibold text-ink">{formState.full_name || "الاسم الكامل"}</h3>
            <p className="text-sm text-muted">{formState.short_bio || "نبذة مختصرة"}</p>
          </div>
        </section>

        {isEditMode && martyrId ? (
          <section className="space-y-3 rounded-2xl border border-stone bg-white p-4 shadow-soft">
            <h2 className="text-base font-semibold text-ink">معرض الصور</h2>

            <div className="space-y-2 rounded-xl border border-stone p-3">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setGalleryImage(event.target.files?.[0] ?? null)}
                className="w-full text-sm"
              />
              <input
                value={galleryAltText}
                onChange={(event) => setGalleryAltText(event.target.value)}
                placeholder="وصف الصورة (اختياري)"
                className="w-full rounded-lg border border-stone px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={onUploadGallery}
                className="rounded-lg bg-accent px-4 py-2 text-sm text-white"
                disabled={!galleryImage}
              >
                رفع صورة
              </button>
            </div>

            <div className="space-y-2">
              {martyr?.gallery_images.map((image) => (
                <div key={image.id} className="flex items-center justify-between rounded-lg border border-stone p-2">
                  <span className="text-xs text-muted">{image.alt_text || "بدون وصف"}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteGalleryImage(image.id)}
                    className="text-xs text-red-700"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
