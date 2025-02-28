from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import pytz
from models import Task, db

task_bp = Blueprint('task_bp', __name__)

japan_tz = pytz.timezone('Asia/Tokyo')

# タスク一覧を取得
@task_bp.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    tasks = Task.query.all()

    return jsonify([{
        "id": task.id,
        "user_id": task.user_id,
        "title": task.title,
        "created_at": task.created_at.astimezone(japan_tz).isoformat(),
        "due_date": task.due_date.astimezone(japan_tz).isoformat() if task.due_date else None,
        "completed_time": task.completed_time.astimezone(japan_tz).isoformat() if task.completed_time else None,
        "completed": task.completed
    } for task in tasks])

# タスクを追加
@task_bp.route('/tasks', methods=['POST'])
@jwt_required()
def add_task():
    data = request.json
    created_at_japan_time = datetime.now(japan_tz)

    user_id = get_jwt_identity()

    if not user_id:
        return jsonify({"message": "User not authenticated"}), 401

    due_date = None
    if 'due_date' in data and data['due_date']:
        try:
            due_date = datetime.fromisoformat(data['due_date']).astimezone(japan_tz)
        except ValueError:
            return jsonify({"message": "Invalid due_date format"}), 400

    new_task = Task(
        user_id=user_id,
        title=data['title'],
        completed=False,
        created_at=created_at_japan_time,
        due_date=due_date
    )

    db.session.add(new_task)
    db.session.commit()

    return jsonify({
        "id": new_task.id,
        "user_id": new_task.user_id,
        "title": new_task.title,
        "created_at": new_task.created_at.astimezone(japan_tz).isoformat(),
        "due_date": new_task.due_date.astimezone(japan_tz).isoformat() if new_task.due_date else None,
        "completed_time": new_task.completed_time.astimezone(japan_tz).isoformat() if new_task.completed_time else None,
        "completed": new_task.completed
    })

# タスクの完了状態を更新
@task_bp.route('/tasks/<int:id>', methods=['PUT'])
@jwt_required()
def update_task(id):
    task = Task.query.get(id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    data = request.get_json()

    if 'completed' in data:
        task.completed = data['completed']
        if task.completed:
            task.completed_time = datetime.now(japan_tz)
        else:
            task.completed_time = None

    db.session.commit()

    return jsonify({
        "id": task.id,
        "user_id": task.user_id,
        "title": task.title,
        "created_at": task.created_at.astimezone(japan_tz).isoformat(),
        "due_date": task.due_date.astimezone(japan_tz).isoformat() if task.due_date else None,
        "completed_time": task.completed_time.astimezone(japan_tz).isoformat() if task.completed_time else None,
        "completed": task.completed
    }), 200

# タスクの期限を更新
@task_bp.route('/tasks/<int:id>/due_date', methods=['PUT'])
@jwt_required()
def update_due_date(id):
    task = Task.query.get(id)
    if not task:
        return jsonify({"message": "Task not found"}), 404

    data = request.json
    if 'due_date' in data and data['due_date']:
        try:
            task.due_date = datetime.fromisoformat(data['due_date']).astimezone(japan_tz)
        except ValueError:
            return jsonify({"message": "Invalid due_date format"}), 400
    else:
        task.due_date = None

    db.session.commit()
    return jsonify({"message": "Due date updated!"})

# タスクを削除
@task_bp.route('/tasks/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_task(id):
    task = Task.query.get(id)
    if not task:
        return jsonify({"message": "Task not found"}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted!"})