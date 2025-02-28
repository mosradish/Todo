from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import User

# Blueprintの作成
user_bp = Blueprint('user', __name__)

# ユーザー情報取得エンドポイント
@user_bp.route('/api/user', methods=['GET'])
@jwt_required()
def get_user():
    print("JWTの中身:", get_jwt())  # JWTのペイロードをログ出力
    user_id = get_jwt_identity()

    if isinstance(user_id, str):
        try:
            user_id = int(user_id)
        except ValueError:
            return jsonify({"message": "無効なユーザーID"}), 400

    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "ユーザーが見つかりません"}), 404

    return jsonify({"user_id": user.id, "user_name": user.name})