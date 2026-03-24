"use client";

import { FormEvent, useState } from "react";

import { ApiError, submitSubmission } from "@/lib/api";

export default function ContactPage() {
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatusMessage("");

    const form = new FormData(event.currentTarget);

    try {
      await submitSubmission({
        submitter_name: String(form.get("submitter_name") || ""),
        submitter_email: String(form.get("submitter_email") || ""),
        message: String(form.get("message") || "")
      });
      setStatusMessage("تم استلام رسالتك بنجاح، وستتم مراجعتها من فريق الإدارة.");
      event.currentTarget.reset();
    } catch (error) {
      if (error instanceof ApiError) {
        setStatusMessage(error.message);
      } else {
        setStatusMessage("تعذر إرسال الرسالة الآن. يرجى المحاولة لاحقًا.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-ink">تواصل وتصحيح المعلومات</h1>
        <p className="max-w-3xl text-muted">
          يمكنك إرسال تصحيح أو إضافة موثقة بخصوص سجلات شهداء القرى والبلدات في ريف حلب الجنوبي. لن
          يتم نشر أي معلومات قبل مراجعتها.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-stone bg-white p-6 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="submitter_name" className="mb-1 block text-sm text-muted">
              الاسم (اختياري)
            </label>
            <input
              id="submitter_name"
              name="submitter_name"
              className="w-full rounded-xl border border-stone px-3 py-2 outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="submitter_email" className="mb-1 block text-sm text-muted">
              البريد الإلكتروني (اختياري)
            </label>
            <input
              id="submitter_email"
              name="submitter_email"
              type="email"
              className="w-full rounded-xl border border-stone px-3 py-2 outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="message" className="mb-1 block text-sm text-muted">
            الرسالة
          </label>
          <textarea
            id="message"
            name="message"
            required
            minLength={10}
            rows={6}
            className="w-full rounded-xl border border-stone px-3 py-2 outline-none focus:border-accent"
            placeholder="اكتب التصحيح أو المعلومات الإضافية بشكل واضح"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-accent px-5 py-2 text-sm text-white disabled:opacity-60"
        >
          {isLoading ? "جارٍ الإرسال..." : "إرسال"}
        </button>

        {statusMessage ? <p className="text-sm text-muted">{statusMessage}</p> : null}
      </form>
    </div>
  );
}
