from flask import Blueprint, request, jsonify
from models import User, db

register_bp = Blueprint('register', __name__)

@register_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({"message": "全てのフィールドを入力してください。"}), 400

    # 既存ユーザーのチェック
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "既に登録されたメールアドレスです。"}), 409

    # 新しいユーザーの作成
    new_user = User(name=name, email=email)
    new_user.set_password(password)  # bcrypt でハッシュ化
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "ユーザー登録に成功しました。"}), 201
