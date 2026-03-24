"""Initial schema

Revision ID: 20260324_0001
Revises:
Create Date: 2026-03-24 10:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260324_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "admin_users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=80), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
    )
    op.create_index("ix_admin_users_username", "admin_users", ["username"], unique=False)

    op.create_table(
        "cities",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name_ar", sa.String(length=120), nullable=False),
        sa.Column("name_en", sa.String(length=120), nullable=True),
        sa.Column("slug", sa.String(length=140), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_cities_name_ar", "cities", ["name_ar"], unique=False)
    op.create_index("ix_cities_slug", "cities", ["slug"], unique=True)

    op.create_table(
        "martyrs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("main_image_url", sa.Text(), nullable=True),
        sa.Column("main_image_public_id", sa.String(length=255), nullable=True),
        sa.Column("city_id", sa.Integer(), nullable=False),
        sa.Column("birth_date", sa.Date(), nullable=True),
        sa.Column("martyrdom_date", sa.Date(), nullable=False),
        sa.Column("age", sa.Integer(), nullable=True),
        sa.Column("short_bio", sa.String(length=500), nullable=True),
        sa.Column("full_story", sa.Text(), nullable=True),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["city_id"], ["cities.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_martyrs_city_id", "martyrs", ["city_id"], unique=False)
    op.create_index("ix_martyrs_full_name", "martyrs", ["full_name"], unique=False)
    op.create_index("ix_martyrs_is_featured", "martyrs", ["is_featured"], unique=False)
    op.create_index("ix_martyrs_is_published", "martyrs", ["is_published"], unique=False)
    op.create_index("ix_martyrs_martyrdom_date", "martyrs", ["martyrdom_date"], unique=False)
    op.create_index("ix_martyrs_slug", "martyrs", ["slug"], unique=True)
    op.create_index("ix_martyrs_city_date", "martyrs", ["city_id", "martyrdom_date"], unique=False)
    op.create_index("ix_martyrs_name_search", "martyrs", ["full_name"], unique=False)

    op.create_table(
        "gallery_images",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("martyr_id", sa.Integer(), nullable=False),
        sa.Column("image_url", sa.Text(), nullable=False),
        sa.Column("public_id", sa.String(length=255), nullable=False),
        sa.Column("alt_text", sa.String(length=255), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["martyr_id"], ["martyrs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_gallery_images_martyr_id", "gallery_images", ["martyr_id"], unique=False)
    op.create_index("ix_gallery_images_public_id", "gallery_images", ["public_id"], unique=False)

    op.create_table(
        "submissions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("martyr_id", sa.Integer(), nullable=True),
        sa.Column("submitter_name", sa.String(length=120), nullable=True),
        sa.Column("submitter_email", sa.String(length=255), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("PENDING", "REVIEWED", "APPROVED", "REJECTED", name="submissionstatus"),
            nullable=False,
            server_default="PENDING",
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["martyr_id"], ["martyrs.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_submissions_martyr_id", "submissions", ["martyr_id"], unique=False)
    op.create_index("ix_submissions_status", "submissions", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_submissions_status", table_name="submissions")
    op.drop_index("ix_submissions_martyr_id", table_name="submissions")
    op.drop_table("submissions")

    op.drop_index("ix_gallery_images_public_id", table_name="gallery_images")
    op.drop_index("ix_gallery_images_martyr_id", table_name="gallery_images")
    op.drop_table("gallery_images")

    op.drop_index("ix_martyrs_name_search", table_name="martyrs")
    op.drop_index("ix_martyrs_city_date", table_name="martyrs")
    op.drop_index("ix_martyrs_slug", table_name="martyrs")
    op.drop_index("ix_martyrs_martyrdom_date", table_name="martyrs")
    op.drop_index("ix_martyrs_is_published", table_name="martyrs")
    op.drop_index("ix_martyrs_is_featured", table_name="martyrs")
    op.drop_index("ix_martyrs_full_name", table_name="martyrs")
    op.drop_index("ix_martyrs_city_id", table_name="martyrs")
    op.drop_table("martyrs")

    op.drop_index("ix_cities_slug", table_name="cities")
    op.drop_index("ix_cities_name_ar", table_name="cities")
    op.drop_table("cities")

    op.drop_index("ix_admin_users_username", table_name="admin_users")
    op.drop_table("admin_users")
