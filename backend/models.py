from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    # 1対多のリレーション（User 1人に対して Task 複数）
    tasks = db.relationship('Task', backref='user', lazy=True)

# タスクのデータモデル
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # 外部キーを追加
    title = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=True)  # 期限を追加
    completed_time = db.Column(db.DateTime, nullable=True)
    # 完了 / 未完了
    completed = db.Column(db.Boolean, default=False)
