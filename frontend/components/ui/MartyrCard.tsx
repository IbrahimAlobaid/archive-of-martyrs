import Image from "next/image";
import Link from "next/link";

import { MartyrListItem } from "@/lib/types";
import { formatArabicDate } from "@/lib/utils";

type MartyrCardProps = {
  martyr: MartyrListItem;
};

export function MartyrCard({ martyr }: MartyrCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-stone bg-white shadow-soft">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone/30">
        <Image
          src={martyr.main_image_url || "/images/placeholder-martyr.svg"}
          alt={`صورة ${martyr.full_name}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="space-y-3 p-4">
        <h3 className="text-base font-semibold text-ink">{martyr.full_name}</h3>
        <p className="text-sm text-muted">{martyr.village.name_ar}</p>
        <p className="text-sm text-muted">تاريخ الاستشهاد: {formatArabicDate(martyr.martyrdom_date)}</p>
        {martyr.age ? <p className="text-sm text-muted">العمر: {martyr.age}</p> : null}
        {martyr.short_bio ? <p className="line-clamp-2 text-sm text-muted">{martyr.short_bio}</p> : null}
        <Link
          href={`/martyrs/${martyr.slug}`}
          className="inline-flex rounded-lg border border-stone px-3 py-2 text-sm text-ink transition hover:bg-sand"
        >
          قراءة السيرة
        </Link>
      </div>
    </article>
  );
}
