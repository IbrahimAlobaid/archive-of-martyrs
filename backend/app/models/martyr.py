from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Martyr(Base):
    __tablename__ = "martyrs"
    __table_args__ = (
        Index("ix_martyrs_village_date", "village_id", "martyrdom_date"),
        Index("ix_martyrs_name_search", "full_name"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    main_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    main_image_public_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    village_id: Mapped[int] = mapped_column(ForeignKey("villages.id"), index=True, nullable=False)
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    martyrdom_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    short_bio: Mapped[str | None] = mapped_column(String(500), nullable=True)
    full_story: Mapped[str | None] = mapped_column(Text, nullable=True)

    is_published: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    village = relationship("Village", back_populates="martyrs")
    gallery_images = relationship(
        "GalleryImage",
        back_populates="martyr",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="GalleryImage.sort_order",
    )
    submissions = relationship("Submission", back_populates="martyr")
