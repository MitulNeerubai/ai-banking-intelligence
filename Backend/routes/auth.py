"""
Auth routes — /register, /login, /protected
Thin handlers: parse request → call service → return JSON.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from services import auth_service
from models import user as user_model
from utils.db import get_db

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/")
def index():
    """Root endpoint."""
    return jsonify({"message": "GuideSpend AI Backend Running", "status": "ok"})


@auth_bp.route("/health")
def health():
    """Health check with DB connectivity test."""
    try:
        with get_db() as (conn, cur):
            cur.execute("SELECT 1")
        return jsonify({"status": "healthy", "database": "connected"})
    except Exception as e:
        return jsonify({"status": "unhealthy", "database": str(e)}), 503


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    result = auth_service.register_user(
        username=data.get("username", ""),
        email=data.get("email", ""),
        password=data.get("password", ""),
    )
    return jsonify(result), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    result = auth_service.authenticate_user(
        email=data.get("email", ""),
        password=data.get("password", ""),
    )
    return jsonify(result)


@auth_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"logged_in_as": current_user})


@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """Return the authenticated user's public profile (no password)."""
    user_id = int(get_jwt_identity())
    row = user_model.find_by_id(user_id)
    if not row:
        return jsonify({"error": "User not found"}), 404
    uid, username, email = row
    return jsonify({"id": uid, "username": username, "email": email})
