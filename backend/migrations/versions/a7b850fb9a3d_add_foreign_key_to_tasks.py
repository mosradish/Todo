"""Add foreign key to tasks

Revision ID: a7b850fb9a3d
Revises: 
Create Date: 2025-02-26 11:03:15.457695

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a7b850fb9a3d'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('task', schema=None) as batch_op:
        # 外部キー制約に名前を付ける
        batch_op.create_foreign_key('fk_task_user', 'user', ['user_id'], ['id'])

def downgrade():
    with op.batch_alter_table('task', schema=None) as batch_op:
        # 外部キー制約を削除する
        batch_op.drop_constraint('fk_task_user', type_='foreignkey')