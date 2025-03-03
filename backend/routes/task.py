from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import pytz
from models import Task, db
from dateutil import parser
import sys  # 🔥 sys をインポート

task_bp = Blueprint('task_bp', __name__)

japan_tz = pytz.timezone('Asia/Tokyo')

# タスク一覧を取得
@task_bp.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    try:
        current_user_id = get_jwt_identity()
        print(f"取得したユーザーID (raw): {current_user_id}")  # 🔥 デバッグ

        if not current_user_id:
            return jsonify({"message": "認証エラー: ユーザーIDが取得できません"}), 401

        current_user_id = int(current_user_id)  # 🔥 `int()` に変換

        tasks = Task.query.filter_by(user_id=current_user_id).all()
        print(f"取得したタスク数: {len(tasks)}")  # 🔥 デバッグ

        return jsonify([{
            "id": task.id,
            "user_id": task.user_id,
            "title": task.title,
            "created_at": task.created_at.isoformat() if task.created_at else None,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "completed_time": task.completed_time.isoformat() if task.completed_time else None,
            "completed": task.completed
        } for task in tasks])

    except Exception as e:
        print(f"エラー発生: {str(e)}")
        return jsonify({"message": f"サーバーエラー: {str(e)}"}), 500


# タスクを追加
@task_bp.route('/tasks', methods=['POST'])
@jwt_required()
def add_task():
    try:
        data = request.get_json()
        print(f"受信データ: {data}")  # 🔥 デバッグ用
        sys.stdout.flush()  # 🔥 標準出力をフラッシュ（すぐに表示）

        if not data or 'title' not in data:
            return jsonify({"message": "タイトルが必要です"}), 400

        user_id = get_jwt_identity()
        print(f"取得したユーザーID (raw): {user_id}")  # 🔥 デバッグ用
        sys.stdout.flush()  # 🔥 標準出力をフラッシュ

        user_id = int(user_id)  # 🔥 `int()` に変換
        print(f"変換後のユーザーID: {user_id}")  # 🔥 デバッグ用
        sys.stdout.flush()  # 🔥 標準出力をフラッシュ

        if not user_id:
            return jsonify({"message": "認証エラー: ユーザーIDが取得できません"}), 401

        due_date = None
        if 'due_date' in data and data['due_date']:
            try:
                due_date = datetime.fromisoformat(data['due_date']).astimezone(japan_tz)
            except ValueError:
                return jsonify({"message": "無効な due_date 形式"}), 400

        new_task = Task(
            user_id=user_id,
            title=data['title'],
            completed=False,
            created_at=datetime.now(japan_tz),
            due_date=due_date
        )

        db.session.add(new_task)
        db.session.commit()

        return jsonify({
            "id": new_task.id,
            "user_id": new_task.user_id,
            "title": new_task.title,
            "created_at": new_task.created_at.isoformat(),
            "due_date": new_task.due_date.isoformat() if new_task.due_date else None,
            "completed_time": new_task.completed_time.isoformat() if new_task.completed_time else None,
            "completed": new_task.completed
        })

    except Exception as e:
        print(f"エラー発生: {str(e)}")  # 🔥 Flask のログにエラーを出力
        sys.stdout.flush()  # 🔥 標準出力をフラッシュ
        return jsonify({"message": f"サーバーエラー: {str(e)}"}), 500


# タスクの完了状態を更新
@task_bp.route('/tasks/<int:id>', methods=['PUT'])
@jwt_required()
def update_task(id):
    try:
        task = Task.query.get(id)
        if not task:
            return jsonify({"error": "Task not found"}), 404

        data = request.get_json()

        # タスクの完了状態を更新
        if 'completed' in data:
            task.completed = data['completed']
            if task.completed:
                task.completed_time = datetime.now(japan_tz)  # 🎯 完了時間を保存
            else:
                task.completed_time = None  # 🎯 未完了に戻した場合、完了時間をリセット

        db.session.commit()  # 変更を確実に保存 🔥

        return jsonify({
            "id": task.id,
            "user_id": task.user_id,
            "title": task.title,
            "created_at": task.created_at.astimezone(japan_tz).isoformat(),
            "due_date": task.due_date.astimezone(japan_tz).isoformat() if task.due_date else None,
            "completed_time": task.completed_time.astimezone(japan_tz).isoformat() if task.completed_time else None,
            "completed": task.completed
        }), 200

    except Exception as e:
        print(f"エラー発生: {str(e)}")
        return jsonify({"message": f"サーバーエラー: {str(e)}"}), 500


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
            due_date = parser.parse(data['due_date']).astimezone(japan_tz)
        except ValueError:
            return jsonify({"message": "Invalid due_date format"}), 400

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