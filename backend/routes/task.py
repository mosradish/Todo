from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import pytz
from models import Task, db
from dateutil import parser
import sys  # sys をインポート

task_bp = Blueprint('task_bp', __name__)

japan_tz = pytz.timezone('Asia/Tokyo')

# タスク一覧を取得
@task_bp.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    try:
        current_user_id = get_jwt_identity()

        if not current_user_id:
            return jsonify({"message": "認証エラー: ユーザーIDが取得できません"}), 401

        current_user_id = int(current_user_id)
        tasks = Task.query.filter_by(user_id=current_user_id).all()

        task_list = []
        for task in tasks:
            task_data = {
                "id": task.id,
                "user_id": task.user_id,
                "title": task.title,
                "created_at": task.created_at.astimezone(japan_tz).isoformat() if task.created_at else None,
                "due_date": task.due_date.astimezone(japan_tz).isoformat() if task.due_date else None,
                "completed_time": task.completed_time.astimezone(japan_tz).isoformat() if task.completed_time else None,
                "completed": task.completed
            }
            task_list.append(task_data)

        print("デバッグ: 取得したタスクデータ:", task_list)  # デバッグ用ログ
        return jsonify(task_list)

    except Exception as e:
        print(f"エラー発生: {str(e)}", file=sys.stderr)
        return jsonify({"message": f"サーバーエラー: {str(e)}"}), 500



# タスクを追加
@task_bp.route('/tasks', methods=['POST'])
@jwt_required()
def add_task():
    try:
        data = request.get_json()
        if not data or 'title' not in data:
            return jsonify({"message": "タイトルが必要です"}), 400

        user_id = int(get_jwt_identity())

        due_date = None
        if 'due_date' in data and data['due_date']:
            try:
                dt_parsed = parser.parse(data['due_date'])
                if dt_parsed.tzinfo is None:
                    dt_parsed = japan_tz.localize(dt_parsed)  
                due_date = dt_parsed.astimezone(pytz.utc)  # UTC に変換して保存
            except ValueError:
                return jsonify({"message": "無効な due_date 形式"}), 400

        new_task = Task(
            user_id=user_id,
            title=data['title'],
            completed=False,
            created_at=datetime.now(pytz.utc),  # ここを明示的にUTC
            due_date=due_date
        )

        db.session.add(new_task)
        db.session.commit()

        return jsonify({
            "id": new_task.id,
            "user_id": new_task.user_id,
            "title": new_task.title,
            "created_at": new_task.created_at.isoformat(),  # UTCで取得
            "due_date": new_task.due_date.isoformat() if new_task.due_date else None,
            "completed_time": new_task.completed_time.isoformat() if new_task.completed_time else None,
            "completed": new_task.completed
        })

    except Exception as e:
        print(f"エラー発生: {str(e)}")
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
                task.completed_time = datetime.now().astimezone(japan_tz)
            else:
                task.completed_time = None  # 未完了に戻した場合、完了時間をリセット

        db.session.commit()  # 変更を確実に保存 

        return jsonify({
            "id": task.id,
            "user_id": task.user_id,
            "title": task.title,
            "created_at": task.created_at.isoformat() if task.created_at else None,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "completed_time": task.completed_time.isoformat() if task.completed_time else None,
            "completed": task.completed
        }), 200

    except Exception as e:
        print(f"エラー発生: {str(e)}")
        return jsonify({"message": f"サーバーエラー: {str(e)}"}), 500


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
