"""
routes/users_route.py — User management endpoints (admin only).

GET /users         → List all users (admin)
GET /users/<id>    → Get single user (admin)
"""
import logging
from flask import Blueprint, request, jsonify
from models import user as user_model
from utils.decorators import token_required, admin_required

logger = logging.getLogger(__name__)
users_bp = Blueprint("users", __name__, url_prefix="/users")


def _parse_pagination():
    try:
        page = max(1, int(request.args.get("page", 1)))
    except (TypeError, ValueError):
        page = 1
    try:
        limit = min(max(1, int(request.args.get("limit", 20))), 100)
    except (TypeError, ValueError):
        limit = 20
    return page, limit


# ── GET /users ────────────────────────────────────────────────────────────────

@users_bp.route("", methods=["GET"])
@admin_required
def list_users(current_user):
    page, limit = _parse_pagination()
    col = user_model._col()
    skip = (page - 1) * limit
    total = col.count_documents({})
    cursor = col.find({}).skip(skip).limit(limit)
    users = [user_model.serialize(u) for u in cursor]
    return jsonify({
        "users": users,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit,
        },
    }), 200


# ── GET /users/<id> ───────────────────────────────────────────────────────────

@users_bp.route("/<user_id>", methods=["GET"])
@admin_required
def get_user(user_id, current_user):
    u = user_model.find_by_id(user_id)
    if not u:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user_model.serialize(u)}), 200
