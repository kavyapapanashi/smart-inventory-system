"""
routes/inventory.py — Inventory management endpoints.

GET    /items              → List items (paginated) — authenticated
POST   /items              → Add item  — admin only
PUT    /items/<item_id>    → Update item — admin only
DELETE /items/<item_id>    → Delete item — admin only
GET    /items/<item_id>    → Get single item — authenticated
"""
import logging
from flask import Blueprint, request, jsonify
from models import item as item_model
from utils.decorators import token_required, admin_required

logger = logging.getLogger(__name__)
inventory_bp = Blueprint("inventory", __name__, url_prefix="/items")


# ── Helpers ───────────────────────────────────────────────────────────────────

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


def _validate_item_fields(data: dict) -> str | None:
    """Return an error message string, or None if valid."""
    name = (data.get("name") or "").strip()
    if not name:
        return "Item name must not be empty"
    quantity = data.get("quantity")
    if quantity is None:
        return "Quantity is required"
    try:
        qty = int(quantity)
    except (TypeError, ValueError):
        return "Quantity must be a numeric value"
    if qty < 0:
        return "Quantity must be non-negative"
    return None


# ── GET /items ────────────────────────────────────────────────────────────────

@inventory_bp.route("", methods=["GET"])
@token_required
def list_items(current_user):
    page, limit = _parse_pagination()
    items, total = item_model.find_all(page, limit)
    return jsonify({
        "items": items,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit,
        },
    }), 200


# ── GET /items/<item_id> ──────────────────────────────────────────────────────

@inventory_bp.route("/<item_id>", methods=["GET"])
@token_required
def get_item(item_id, current_user):
    item = item_model.find_by_id(item_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404
    return jsonify({"item": item}), 200


# ── POST /items ───────────────────────────────────────────────────────────────

@inventory_bp.route("", methods=["POST"])
@admin_required
def add_item(current_user):
    data = request.get_json(silent=True) or {}
    error = _validate_item_fields(data)
    if error:
        return jsonify({"error": error}), 400

    name = data["name"].strip()
    quantity = int(data["quantity"])
    description = (data.get("description") or "").strip()

    item_id = item_model.insert_item(name, quantity, description)
    logger.info("Item added | id=%s name=%s qty=%d by user=%s", item_id, name, quantity, current_user["user_id"])
    return jsonify({"message": "Item added successfully", "item_id": item_id}), 201


# ── PUT /items/<item_id> ──────────────────────────────────────────────────────

@inventory_bp.route("/<item_id>", methods=["PUT"])
@admin_required
def update_item(item_id, current_user):
    if not item_model.find_raw_by_id(item_id):
        return jsonify({"error": "Item not found"}), 404

    data = request.get_json(silent=True) or {}
    error = _validate_item_fields(data)
    if error:
        return jsonify({"error": error}), 400

    fields = {
        "name": data["name"].strip(),
        "quantity": int(data["quantity"]),
        "description": (data.get("description") or "").strip(),
    }
    updated = item_model.update_item(item_id, fields)
    if not updated:
        return jsonify({"error": "Update failed"}), 500

    logger.info("Item updated | id=%s by user=%s", item_id, current_user["user_id"])
    return jsonify({"message": "Item updated successfully"}), 200


# ── DELETE /items/<item_id> ───────────────────────────────────────────────────

@inventory_bp.route("/<item_id>", methods=["DELETE"])
@admin_required
def delete_item(item_id, current_user):
    if not item_model.find_raw_by_id(item_id):
        return jsonify({"error": "Item not found"}), 404

    deleted = item_model.delete_item(item_id)
    if not deleted:
        return jsonify({"error": "Delete failed"}), 500

    logger.info("Item deleted | id=%s by user=%s", item_id, current_user["user_id"])
    return jsonify({"message": "Item deleted successfully"}), 200
