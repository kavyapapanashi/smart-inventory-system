"""
utils/decorators.py — Route protection decorators for JWT auth and RBAC.
"""
import logging
from functools import wraps
from flask import request, jsonify
from utils.jwt_helper import decode_token

logger = logging.getLogger(__name__)


def token_required(f):
    """Verify JWT in Authorization header and attach payload to kwargs."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            logger.warning("Missing or malformed Authorization header")
            return jsonify({"error": "Authorization token is missing or malformed"}), 401

        token = auth_header.split(" ", 1)[1]
        payload = decode_token(token)
        if payload is None:
            return jsonify({"error": "Token is invalid or has expired"}), 401

        logger.info(
            "Authenticated request | user_id=%s role=%s endpoint=%s",
            payload.get("user_id"), payload.get("role"), request.path,
        )
        return f(*args, current_user=payload, **kwargs)

    return decorated


def admin_required(f):
    """Allow only users whose role == 'admin'."""
    @wraps(f)
    @token_required
    def decorated(*args, current_user, **kwargs):
        if current_user.get("role") != "admin":
            logger.warning(
                "Forbidden: user_id=%s tried to access admin endpoint %s",
                current_user.get("user_id"), request.path,
            )
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, current_user=current_user, **kwargs)

    return decorated
