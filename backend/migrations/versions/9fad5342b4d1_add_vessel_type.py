"""add vessel type

Revision ID: 9fad5342b4d1
Revises: 
Create Date: 2025-06-05 06:31:32.990090

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9fad5342b4d1'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add type column to vessels."""
    op.add_column('vessels', sa.Column('type', sa.Integer(), nullable=True))


def downgrade() -> None:
    """Remove type column from vessels."""
    op.drop_column('vessels', 'type')
