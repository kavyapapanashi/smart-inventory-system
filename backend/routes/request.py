"""
routes/request.py — Stock-request management endpoints.

POST /requests              → Create a request (user)
GET  /requests              → List all requests (paginated, authenticated)
PUT  /requests/<id>/approve → Approve a request (admin only)
PUT  /requests/<id>/reject  → Reject a request (admin only)
"""
import logging
from flask import Blueprint, request, jsonify
from models import request_model
from models import item as item_model
from utils.decorators import token_required, admin_required

logger = logging.getLogger(__name__)
request_bp = Blueprint("requests", __name__, url_prefix="/requests")


def _parse_pagination() -> tuple[int, int]:
    try:
        page = max(1, int(request.args.get("page", 1)))
    except (TypeError, ValueError):
        page = 1
    try:
        limit = min(max(1, int(request.args.get("limit", 10))), 100)
    except (TypeError, ValueError):
        limit = 10
    return page, limit


# ── POST /requests ────────────────────────────────────────────────────────────

@request_bp.route("", methods=["POST"])
@token_required
def create_request(current_user):
    data = request.get_json(silent=True) or {}

    item_name = (data.get("item_name") or "").strip()
    if not item_name:
        return jsonify({"error": "item_name is required"}), 400

    quantity = data.get("quantity")
    if quantity is None:
        return jsonify({"error": "quantity is required"}), 400
    try:
        quantity = int(quantity)
    except (TypeError, ValueError):
        return jsonify({"error": "quantity must be numeric"}), 400
    if quantity <= 0:
        return jsonify({"error": "quantity must be greater than 0"}), 400

    # Verify the item actually exists
    if not item_model.find_by_name(item_name):
        return jsonify({"error": f"No inventory item named '{item_name}' exists"}), 404

    req_id = request_model.insert_request(item_name, quantity, current_user["user_id"])
    logger.info(
        "Request created | id=%s item=%s qty=%d by user=%s",
        req_id, item_name, quantity, current_user["user_id"],
    )
    return jsonify({"message": "Request submitted successfully", "request_id": req_id}), 201


# ── GET /requests ─────────────────────────────────────────────────────────────

@request_bp.route("", methods=["GET"])
@token_required
def list_requests(current_user):
    page, limit = _parse_pagination()
    requests, total = request_model.find_all(page, limit)
    return jsonify({
        "requests": requests,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit,
        },
    }), 200


# ── PUT /requests/<id>/approve ────────────────────────────────────────────────

@request_bp.route("/<request_id>/approve", methods=["PUT"])
@admin_required
def approve_request(request_id, current_user):
    req = request_model.find_by_id(request_id)
    if not req:
        return jsonify({"error": "Request not found"}), 404
    if req["status"] != request_model.STATUS_PENDING:
        return jsonify({"error": f"Request is already '{req['status']}'"}), 400

    request_model.update_status(request_id, request_model.STATUS_APPROVED)
    logger.info("Request approved | id=%s by admin=%s", request_id, current_user["user_id"])
    return jsonify({"message": "Request approved"}), 200


# ── PUT /requests/<id>/reject ─────────────────────────────────────────────────

@request_bp.route("/<request_id>/reject", methods=["PUT"])
@admin_required
def reject_request(request_id, current_user):
    req = request_model.find_by_id(request_id)
    if not req:
        return jsonify({"error": "Request not found"}), 404
    if req["status"] != request_model.STATUS_PENDING:
        return jsonify({"error": f"Request is already '{req['status']}'"}), 400

    request_model.update_status(request_id, request_model.STATUS_REJECTED)
    logger.info("Request rejected | id=%s by admin=%s", request_id, current_user["user_id"])
    return jsonify({"message": "Request rejected"}), 200
