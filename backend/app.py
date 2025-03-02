from flask import Flask, send_from_directory, g
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
tasks = []
# ReactとFlaskの通信を許可
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

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

@app.route('/')
def serve():
    return send_from_directory(os.path.join(app.root_path, 'frontend/build'), 'index.html')

if __name__ == '__main__':
    app.run(debug=True)