from __future__ import annotations

import asyncio
from datetime import date

from sqlalchemy import select

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.admin_user import AdminUser
from app.models.gallery_image import GalleryImage
from app.models.martyr import Martyr
from app.models.village import Village
from app.utils.slug import slugify


async def seed_admin() -> None:
    settings = get_settings()
    async with AsyncSessionLocal() as session:
        existing = await session.execute(select(AdminUser).where(AdminUser.username == settings.ADMIN_USERNAME))
        admin = existing.scalar_one_or_none()
        if admin:
            return

        session.add(
            AdminUser(
                username=settings.ADMIN_USERNAME,
                hashed_password=hash_password(settings.ADMIN_PASSWORD),
                is_active=True,
            )
        )
        await session.commit()


async def seed_data() -> None:
    async with AsyncSessionLocal() as session:
        existing_village = await session.execute(select(Village.id).limit(1))
        if existing_village.scalar_one_or_none() is not None:
            return

        villages = [
            Village(name_ar="الحاضر", name_en="Al-Hader", slug=slugify("al-hader")),
            Village(name_ar="العيس", name_en="Al-Eis", slug=slugify("al-eis")),
            Village(name_ar="الزربة", name_en="Al-Zirbah", slug=slugify("al-zirbah")),
        ]
        session.add_all(villages)
        await session.flush()

        martyrs = [
            Martyr(
                full_name="أحمد خالد أبو سلمية",
                slug=slugify("ahmad-khaled-abu-salmiya"),
                village_id=villages[0].id,
                birth_date=date(1998, 4, 12),
                martyrdom_date=date(2024, 1, 16),
                age=25,
                short_bio="نشأ في ريف حلب الجنوبي وعُرف بخدمته لأهله في البلدة.",
                full_story="سيرة موجزة تخلد ذكرى الشهيد وتوثق أثره الطيب في أسرته ومجتمعه في ريف حلب الجنوبي.",
                is_published=True,
                is_featured=True,
                main_image_url="https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=crop&w=1200&q=80",
                main_image_public_id="demo/main/ahmad",
            ),
            Martyr(
                full_name="محمد سعيد النجار",
                slug=slugify("mohammad-saeed-alnajar"),
                village_id=villages[1].id,
                martyrdom_date=date(2023, 12, 3),
                age=29,
                short_bio="من أبناء بلدة العيس، عُرف بحسن الخلق وحرصه على مساعدة الآخرين.",
                full_story="قصة إنسانية موجزة تحفظ السيرة وتنقلها بأمانة واحترام ضمن أرشيف شهداء ريف حلب الجنوبي.",
                is_published=True,
                is_featured=False,
                main_image_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
                main_image_public_id="demo/main/mohammad",
            ),
            Martyr(
                full_name="سليم عاطف شعت",
                slug=slugify("salim-atef-shaat"),
                village_id=villages[2].id,
                martyrdom_date=date(2022, 5, 8),
                age=34,
                short_bio="من بلدة الزربة، ترك أثراً طيباً في أسرته ومحيطه.",
                full_story="بيانات تجريبية أولية تعكس طبيعة الأرشيف المخصص لشهداء القرى والبلدات في ريف حلب الجنوبي.",
                is_published=True,
                is_featured=True,
                main_image_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80",
                main_image_public_id="demo/main/salim",
            ),
        ]

        session.add_all(martyrs)
        await session.flush()

        gallery = [
            GalleryImage(
                martyr_id=martyrs[0].id,
                image_url="https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=1200&q=80",
                public_id="demo/gallery/ahmad-1",
                alt_text="صورة إضافية",
                sort_order=0,
            ),
            GalleryImage(
                martyr_id=martyrs[0].id,
                image_url="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=1200&q=80",
                public_id="demo/gallery/ahmad-2",
                alt_text="صورة إضافية",
                sort_order=1,
            ),
        ]

        session.add_all(gallery)
        await session.commit()


async def main() -> None:
    await seed_admin()
    await seed_data()
    print("Seed completed successfully")


if __name__ == "__main__":
    asyncio.run(main())
