from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models import User, db

register_bp = Blueprint('register', __name__)

@register_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "email and password are required"}), 400

    # 既存ユーザーのチェック
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "email already exists"}), 409

    # パスワードをハッシュ化して保存
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    new_user = User(name=name, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201