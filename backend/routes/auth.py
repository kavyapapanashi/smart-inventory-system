"""
routes/auth.py — Registration and login endpoints.

POST /auth/register
POST /auth/login
GET  /auth/me  (protected)
"""
import logging
import bcrypt
from flask import Blueprint, request, jsonify
from models import user as user_model
from utils.jwt_helper import generate_token
from utils.decorators import token_required

logger = logging.getLogger(__name__)
auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

VALID_ROLES = {"admin", "user"}


# ── POST /auth/register ───────────────────────────────────────────────────────

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    # ── Validate required fields ──────────────────────────────────────────────
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = (data.get("role") or "user").strip().lower()

    if not name:
        return jsonify({"error": "Name is required"}), 400
    if not email:
        return jsonify({"error": "Email is required"}), 400
    if not password or len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if role not in VALID_ROLES:
        return jsonify({"error": f"Role must be one of: {', '.join(VALID_ROLES)}"}), 400

    # ── Check duplicate ───────────────────────────────────────────────────────
    if user_model.email_exists(email):
        return jsonify({"error": "Email is already registered"}), 409

    # ── Hash password and store ───────────────────────────────────────────────
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user_id = user_model.insert_user(name, email, hashed, role)

    logger.info("New user registered | id=%s email=%s role=%s", user_id, email, role)
    return jsonify({"message": "Registration successful", "user_id": user_id}), 201


# ── POST /auth/login ──────────────────────────────────────────────────────────

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = user_model.find_by_email(email)
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    # ── Verify password ───────────────────────────────────────────────────────
    if not bcrypt.checkpw(password.encode(), user["password"].encode()):
        logger.warning("Failed login attempt for email=%s", email)
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token(str(user["_id"]), user["role"])
    logger.info("User logged in | id=%s role=%s", user["_id"], user["role"])

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user_model.serialize(user),
    }), 200


# ── GET /auth/me ──────────────────────────────────────────────────────────────

@auth_bp.route("/me", methods=["GET"])
@token_required
def me(current_user):
    user = user_model.find_by_id(current_user["user_id"])
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user_model.serialize(user)}), 200
