"""
models/item.py — Inventory item collection helpers.
"""
from bson import ObjectId
from models.db import get_db


def _col():
    return get_db()["items"]


def create_indexes():
    _col().create_index("name")


# ── CRUD ─────────────────────────────────────────────────────────────────────

def insert_item(name: str, quantity: int, description: str = "") -> str:
    doc = {"name": name, "quantity": quantity, "description": description}
    result = _col().insert_one(doc)
    return str(result.inserted_id)


def find_all(page: int = 1, limit: int = 10) -> tuple[list, int]:
    """Return (items_list, total_count) for pagination."""
    skip = (page - 1) * limit
    total = _col().count_documents({})
    cursor = _col().find({}).skip(skip).limit(limit)
    return [serialize(doc) for doc in cursor], total


def find_by_id(item_id: str) -> dict | None:
    try:
        doc = _col().find_one({"_id": ObjectId(item_id)})
        return serialize(doc) if doc else None
    except Exception:
        return None


def find_raw_by_id(item_id: str) -> dict | None:
    """Return the raw MongoDB doc (for updates)."""
    try:
        return _col().find_one({"_id": ObjectId(item_id)})
    except Exception:
        return None


def update_item(item_id: str, fields: dict) -> bool:
    try:
        result = _col().update_one(
            {"_id": ObjectId(item_id)}, {"$set": fields}
        )
        return result.matched_count > 0
    except Exception:
        return False


def delete_item(item_id: str) -> bool:
    try:
        result = _col().delete_one({"_id": ObjectId(item_id)})
        return result.deleted_count > 0
    except Exception:
        return False


def find_by_name(name: str) -> dict | None:
    doc = _col().find_one({"name": name})
    return serialize(doc) if doc else None


def serialize(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "quantity": doc.get("quantity", 0),
        "description": doc.get("description", ""),
    }
