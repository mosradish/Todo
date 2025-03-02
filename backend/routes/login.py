from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models import User

login_bp = Blueprint('login', __name__)

@login_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or "email" not in data or "password" not in data:
        return jsonify({"message": "Email and password are required"}), 400

    email = data["email"]
    password = data["password"]

    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        return jsonify({"message": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id))  # 🔥 `str(user.id)` に変更

    return jsonify(access_token=access_token, user={"id": user.id, "name": user.name}), 200
