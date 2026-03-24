export default function AboutPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-ink">عن المنصة</h1>
        <p className="max-w-3xl text-muted">
          أرشيف الشهداء مشروع تذكاري مستقل مخصص لشهداء القرى والبلدات في ريف حلب الجنوبي، يهدف إلى
          حفظ الصور والسير بلغة هادئة، وواجهة واضحة، ومعايير دقيقة في التوثيق والنشر.
        </p>
      </header>

      <section className="rounded-2xl border border-stone bg-white p-6 shadow-soft">
        <h2 className="mb-3 text-xl font-semibold text-ink">الدقة وسياسة المراجعة</h2>
        <ul className="list-inside list-disc space-y-2 text-muted">
          <li>لا يتم نشر أي تعديل وارد من الجمهور بشكل تلقائي.</li>
          <li>تخضع البيانات لمراجعة إدارية قبل الاعتماد.</li>
          <li>تُحترم خصوصية العائلات وتُراعى حساسية السياق الإنساني في قرى وبلدات المنطقة.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-stone bg-white p-6 shadow-soft">
        <h2 className="mb-3 text-xl font-semibold text-ink">تنبيه</h2>
        <p className="text-muted">
          المواد المعروضة لأغراض التوثيق التذكاري. إذا لاحظت أي خطأ أو رغبت بتقديم إضافة موثقة، يرجى
          استخدام صفحة التواصل.
        </p>
      </section>
    </div>
  );
}
