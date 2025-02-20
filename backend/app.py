from flask import Flask, send_from_directory, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os
import pytz  # pytzライブラリをインポート

app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')

CORS(app)  # ReactとFlaskの通信を許可
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///todo.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# タスクのデータモデル
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed = db.Column(db.Boolean, default=False)

# 初回起動時のデータベース作成
with app.app_context():
    db.create_all()

@app.route('/')
def index():
       return send_from_directory(os.path.join(app.static_folder), 'index.html')
# タスク一覧を取得
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()

    # 日本時間に変換
    japan_tz = pytz.timezone('Asia/Tokyo')

    return jsonify([{
        "id": task.id,
        "title": task.title,
        "created_at": task.created_at.astimezone(japan_tz).isoformat(),  # 日本時間でISO形式
        "completed": task.completed
    } for task in tasks])

# タスクを追加
@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.json
    # タスクを日本時間で作成
    japan_tz = pytz.timezone('Asia/Tokyo')
    created_at_japan_time = datetime.now(japan_tz)

    new_task = Task(title=data['title'], completed=False, created_at=created_at_japan_time)
    db.session.add(new_task)
    db.session.commit()

    return jsonify({
        "id": new_task.id,
        "title": new_task.title,
        "created_at": new_task.created_at.astimezone(japan_tz).isoformat(),  # 日本時間でISO形式
        "completed": new_task.completed
    })

# タスクの完了状態を更新
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Task not found"}), 404
    task.completed = not task.completed
    db.session.commit()
    return jsonify({"message": "Task updated!"})

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
    app.run(debug=True)
