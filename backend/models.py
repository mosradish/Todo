from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    hashed_password = db.Column(db.String(256), nullable=False)  # カラム名を変更
    tasks = db.relationship('Task', backref='user', lazy=True)

    def set_password(self, password):
        """パスワードをハッシュ化"""
        self.hashed_password = bcrypt.generate_password_hash(password, rounds=12).decode('utf-8')  # コストを12に設定

    def check_password(self, password):
        """パスワードをチェック"""
        return bcrypt.check_password_hash(self.hashed_password, password)

    def __repr__(self):
        return f"<User {self.id}, {self.name}, {self.email}>"

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  
    title = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=True)  # デフォルト値を追加
    completed_time = db.Column(db.DateTime, nullable=True)
    completed = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f"<Task {self.id}, {self.title}, Completed: {self.completed}>"
