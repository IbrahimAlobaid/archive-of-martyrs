"""Rename city entities to village

Revision ID: 20260324_0002
Revises: 20260324_0001
Create Date: 2026-03-24 13:00:00
"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260324_0002"
down_revision: str | None = "20260324_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.rename_table("cities", "villages")
    op.alter_column("martyrs", "city_id", new_column_name="village_id")

    op.execute("ALTER INDEX ix_cities_name_ar RENAME TO ix_villages_name_ar")
    op.execute("ALTER INDEX ix_cities_slug RENAME TO ix_villages_slug")
    op.execute("ALTER INDEX ix_martyrs_city_id RENAME TO ix_martyrs_village_id")
    op.execute("ALTER INDEX ix_martyrs_city_date RENAME TO ix_martyrs_village_date")


def downgrade() -> None:
    op.execute("ALTER INDEX ix_martyrs_village_date RENAME TO ix_martyrs_city_date")
    op.execute("ALTER INDEX ix_martyrs_village_id RENAME TO ix_martyrs_city_id")
    op.execute("ALTER INDEX ix_villages_slug RENAME TO ix_cities_slug")
    op.execute("ALTER INDEX ix_villages_name_ar RENAME TO ix_cities_name_ar")

    op.alter_column("martyrs", "village_id", new_column_name="city_id")
    op.rename_table("villages", "cities")
