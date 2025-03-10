from flask import Flask, send_from_directory, g, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
import os
from flask_jwt_extended import JWTManager, get_jwt
from dotenv import load_dotenv
from models import db  # models.py から db をインポート

#機能import部分
from routes.login import login_bp
from routes.logout import logout_bp
from routes.register import register_bp
from routes.task import task_bp
from routes.user import user_bp

# .env の読み込み
load_dotenv()

app = Flask(__name__)
app.config["DEBUG"] = True  # 🔥 デバッグモードを有効にする
tasks = []
# ReactとFlaskの通信を許可
CORS(app, supports_credentials=True)

# 環境変数 DATABASE_URL が設定されていなければ、SQLite を使用
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv("FLASK_SECRET_KEY", "default_secret_key")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "default_secret_key")

jwt = JWTManager(app)
migrate = Migrate(app, db)
db.init_app(app)  # `app` に紐づける

# ルートの登録
app.register_blueprint(login_bp, url_prefix='/auth')
app.register_blueprint(logout_bp, url_prefix='/auth')
app.register_blueprint(register_bp, url_prefix='/auth')
app.register_blueprint(task_bp, url_prefix='/api')
app.register_blueprint(user_bp, url_prefix='/api')

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    app.run(debug=True)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    # React のビルドディレクトリへのパスを修正
    root_dir = os.path.join(app.root_path, '..', 'frontend', 'build')

    # リクエストされたパスのファイルが存在するなら、それを返す
    if os.path.exists(os.path.join(root_dir, path)):
        return send_from_directory(root_dir, path)

    # 存在しない場合は `index.html` を返す（React のルーティング対応）
    return send_from_directory(root_dir, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)