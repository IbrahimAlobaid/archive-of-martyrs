import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { ImageGallery } from "@/components/ui/ImageGallery";
import { MartyrCard } from "@/components/ui/MartyrCard";
import { ApiError, getMartyrBySlug, getMartyrs } from "@/lib/api";
import { SITE_URL } from "@/lib/constants";
import { formatArabicDate } from "@/lib/utils";

type MartyrPageProps = {
  params: Promise<{ slug: string }>;
};

async function loadMartyrOr404(slug: string) {
  try {
    return await getMartyrBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({ params }: MartyrPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const martyr = await getMartyrBySlug(slug);
    const title = `${martyr.full_name} | أرشيف الشهداء`;
    const description = martyr.short_bio || "سيرة الشهيد في أرشيف الشهداء";
    const ogImage = martyr.main_image_url || "/images/placeholder-martyr.svg";

    return {
      title,
      description,
      alternates: {
        canonical: `/martyrs/${martyr.slug}`
      },
      openGraph: {
        title,
        description,
        type: "article",
        locale: "ar",
        url: `${SITE_URL}/martyrs/${martyr.slug}`,
        images: [{ url: ogImage }]
      }
    };
  } catch {
    return {
      title: "الشهيد غير موجود"
    };
  }
}

export default async function MartyrPage({ params }: MartyrPageProps) {
  const { slug } = await params;
  const martyr = await loadMartyrOr404(slug);

  const related = await getMartyrs({ village: martyr.village.slug, page_size: 4, sort: "newest" }).catch(() => ({
    items: [],
    total: 0,
    page: 1,
    page_size: 4,
    pages: 1
  }));

  const relatedItems = related.items.filter((item) => item.slug !== martyr.slug).slice(0, 3);

  return (
    <article className="space-y-10">
      <section className="grid gap-8 rounded-3xl border border-stone bg-white p-6 shadow-soft md:grid-cols-[1.2fr_1fr] md:p-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-ink md:text-4xl">{martyr.full_name}</h1>
          <dl className="grid grid-cols-1 gap-2 text-sm text-muted">
            <div>
              <dt className="inline">القرية أو البلدة: </dt>
              <dd className="inline">{martyr.village.name_ar}</dd>
            </div>
            <div>
              <dt className="inline">تاريخ الاستشهاد: </dt>
              <dd className="inline">{formatArabicDate(martyr.martyrdom_date)}</dd>
            </div>
            {martyr.birth_date ? (
              <div>
                <dt className="inline">تاريخ الميلاد: </dt>
                <dd className="inline">{formatArabicDate(martyr.birth_date)}</dd>
              </div>
            ) : null}
            {martyr.age ? (
              <div>
                <dt className="inline">العمر: </dt>
                <dd className="inline">{martyr.age}</dd>
              </div>
            ) : null}
          </dl>
          {martyr.short_bio ? <p className="text-base text-muted">{martyr.short_bio}</p> : null}
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone bg-stone/20">
          <Image
            src={martyr.main_image_url || "/images/placeholder-martyr.svg"}
            alt={`صورة ${martyr.full_name}`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-stone bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-xl font-semibold text-ink">السيرة</h2>
        <p className="whitespace-pre-line text-base leading-8 text-muted">
          {martyr.full_story || "لا تتوفر تفاصيل إضافية في الوقت الحالي."}
        </p>
      </section>

      <ImageGallery images={martyr.gallery_images} />

      {relatedItems.length ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-ink">من نفس القرية أو البلدة</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedItems.map((item) => (
              <MartyrCard key={item.id} martyr={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
