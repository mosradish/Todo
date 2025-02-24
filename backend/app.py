from flask import Flask, send_from_directory, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os
import pytz

app = Flask(__name__, static_folder='frontend/build/static')
tasks = []

# ReactとFlaskの通信を許可
CORS(app)

# 環境変数 DATABASE_URL が設定されていなければ、SQLite を使用
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///todo.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# タスクのデータモデル
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=True)  # 期限を追加
    completed_time = db.Column(db.DateTime, nullable=True)
    completed = db.Column(db.Boolean, default=False)

# 初回起動時のデータベース作成
with app.app_context():
    db.create_all()

@app.route('/')
def serve():
    return send_from_directory(os.path.join(app.root_path, 'frontend/build'), 'index.html')

# タスク一覧を取得
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    japan_tz = pytz.timezone('Asia/Tokyo')

    return jsonify([{
        "id": task.id,
        "title": task.title,
        "created_at": task.created_at.astimezone(japan_tz).isoformat(),
        "due_date": task.due_date.astimezone(japan_tz).isoformat(),
        "completed_time": task.completed_time.astimezone(japan_tz).isoformat() if task.completed_time else None,
        "completed": task.completed
    } for task in tasks])

# タスクを追加
@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.json
    japan_tz = pytz.timezone('Asia/Tokyo')
    created_at_japan_time = datetime.now(japan_tz)

    if 'due_date' in data and data['due_date']:
        try:
            due_date = datetime.fromisoformat(data['due_date']).astimezone(japan_tz)
        except ValueError:
            return jsonify({"message": "Invalid due_date format"}), 400

    new_task = Task(title=data['title'], completed=False, created_at=created_at_japan_time, due_date=due_date)
    db.session.add(new_task)
    db.session.commit()

    return jsonify({
        "id": new_task.id,
        "title": new_task.title,
        "created_at": new_task.created_at.astimezone(japan_tz).isoformat(),
        "due_date": new_task.due_date.astimezone(japan_tz).isoformat(),
        "completed_time": new_task.completed_time.astimezone(japan_tz).isoformat() if new_task.completed_time else None,
        "completed": new_task.completed
    })

# タスクの完了状態を更新
@app.route('/api/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    task = Task.query.get(id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    data = request.get_json()
    japan_tz = pytz.timezone('Asia/Tokyo')

    if 'completed' in data:
        task.completed = data['completed']
        if task.completed:
            task.completed_time = datetime.now(japan_tz)
        else:
            task.completed_time = None  # 未完了に戻した場合

    db.session.commit()

    return jsonify({
        "id": task.id,
        "title": task.title,
        "created_at": task.created_at.astimezone(japan_tz).isoformat(),
        "due_date": task.due_date.astimezone(japan_tz).isoformat() if task.due_date else None,
        "completed_time": task.completed_time.astimezone(japan_tz).isoformat() if task.completed_time else None,
        "completed": task.completed
    }), 200

# タスクの期限を更新
@app.route('/api/tasks/<int:task_id>/due_date', methods=['PUT'])
def update_due_date(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Task not found"}), 404

    data = request.json
    japan_tz = pytz.timezone('Asia/Tokyo')
    if 'due_date' in data and data['due_date']:
        try:
            task.due_date = datetime.fromisoformat(data['due_date']).astimezone(japan_tz)
        except ValueError:
            return jsonify({"message": "Invalid due_date format"}), 400
    else:
        task.due_date = None  # 期限を削除する場合

    db.session.commit()
    return jsonify({"message": "Due date updated!"})

# タスクを削除
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Task not found"}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted!"})

if __name__ == '__main__':
    app.run()
