from flask import Flask, send_from_directory, request, jsonify, render_template, redirect, url_for, session, g
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from datetime import datetime
import os
import pytz
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

tasks = []

# ReactとFlaskの通信を許可
CORS(app, 
    supports_credentials=True,
    resources={
        r"/*": {
            "origins": ["http://localhost:5173"],  # Viteのデフォルトポート
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

# 環境変数 DATABASE_URL が設定されていなければ、SQLite を使用
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = os.urandom(24)
app.config['SECRET_KEY'] = os.urandom(24)

jwt = JWTManager(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# ユーザーモデル
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
        "id": task.task_id,
        "user_id": task.user_id,
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

    # user_idの取得とバリデーション
    if 'user_id' not in data or not data['user_id']:
        return jsonify({"message": "user_id is required"}), 400

    user_id = data['user_id']

    # due_date の処理
    due_date = None
    if 'due_date' in data and data['due_date']:
        try:
            due_date = datetime.fromisoformat(data['due_date']).astimezone(japan_tz)
        except ValueError:
            return jsonify({"message": "Invalid due_date format"}), 400

    # タスクの作成
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
        "id": new_task.task_id,
        "user_id": new_task.user_id,
        "title": new_task.title,
        "created_at": new_task.created_at.astimezone(japan_tz).isoformat(),
        "due_date": new_task.due_date.astimezone(japan_tz).isoformat() if new_task.due_date else None,
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
        "id": task.task_id,
        "user_id": task.user_id,
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

# ユーザー登録
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        name = data.get('name')
        email = data.get("email")
        password = data.get("password")

        # 必須項目のチェック
        if not name or not email or not password:
            return jsonify({"message": "すべての項目を入力してください"}), 400

        # すでに登録されているかチェック
        if User.query.filter_by(email=email).first():
            return jsonify({"message": "このメールアドレスは既に登録されています"}), 400

        # パスワードをハッシュ化
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

        # 新しいユーザーを作成
        new_user = User(name=name, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        # JWTトークンを発行（登録後に自動ログイン）
        token = create_access_token(identity=email)
        session['user_id'] = new_user.id  # ユーザーIDをセッションに保存

        return jsonify({"message": "登録成功", "token": token, "user_id": new_user.id}), 201  # IDを返す

    except Exception as e:
        print("登録エラー:", str(e))  # ログに記録
        return jsonify({"message": "サーバーエラーが発生しました"}), 500


#ユーザー情報取得
@app.route('/api/user', methods=['GET'])
@jwt_required()
def get_user():
    try:
        current_user_email = get_jwt_identity()
        user = User.query.filter_by(email=current_user_email).first()
        if user:
            return jsonify({
                "id": user.id,
                "name": user.name,
                "email": user.email
            }), 200
        return jsonify({"message": "User not found"}), 404
    except Exception as e:
        return jsonify({"message": "Token validation failed", "error": str(e)}), 401

#ログイン処理
@app.route('/login', methods=['POST'])
def login():
    data = request.json  # JSONデータとして受け取る
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        session['user_id'] = user.id  # ユーザーIDをセッションに保存
        session['user_name'] = user.name  # ユーザー名をセッションに保存
        token = create_access_token(identity=email)  # JWTトークンを作成
        return jsonify({"message": "ログイン成功", "token": token, "user_id": user.id}), 200

    return jsonify({"message": "メールアドレスまたはパスワードが間違っています"}), 401

# ログアウト処理
@app.route('/logout')
def logout():
    # セッションをクリア
    session.clear()
    # ホームページにリダイレクト
    return redirect('/')  # 直接ルートパスを指定

if __name__ == '__main__':
    app.run()
