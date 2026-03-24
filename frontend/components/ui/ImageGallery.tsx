import Image from "next/image";

import { GalleryImage } from "@/lib/types";

type ImageGalleryProps = {
  images: GalleryImage[];
};

export function ImageGallery({ images }: ImageGalleryProps) {
  if (!images.length) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-ink">معرض الصور</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <figure key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-stone">
            <Image
              src={image.image_url}
              alt={image.alt_text || "صورة في معرض الشهيد"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 30vw"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
