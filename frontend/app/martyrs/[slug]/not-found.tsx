import Link from "next/link";

export default function MartyrNotFoundPage() {
  return (
    <div className="rounded-2xl border border-stone bg-white p-8 text-center shadow-soft">
      <h1 className="mb-3 text-2xl font-semibold text-ink">تعذر العثور على السجل</h1>
      <p className="mb-5 text-muted">
        قد يكون الرابط غير صحيح أو أن السجل غير منشور حاليًا. يمكنك العودة إلى صفحة الأرشيف.
      </p>
      <Link href="/martyrs" className="rounded-lg bg-accent px-4 py-2 text-sm text-white">
        العودة إلى الأرشيف
      </Link>
    </div>
  );
}
