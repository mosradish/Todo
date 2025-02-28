from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

logout_bp = Blueprint('logout', __name__)

@logout_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({"message": "Successfully logged out"}), 200
