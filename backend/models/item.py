"""
models/item.py — Inventory item collection helpers.

Collection: items
Fields:
    _id         : ObjectId  (auto-generated)
    name        : string    (required, 1-200 chars)
    quantity    : int       (required, >= 0)
    description : string    (optional, max 1000 chars)
    author      : string    (optional, supplier/author name)
    image_url   : string    (optional, path or URL to image)
    created_at  : datetime  (auto-set on insert)
    updated_at  : datetime  (auto-set on insert & update)
"""
import datetime
from bson import ObjectId
from pymongo import ASCENDING, DESCENDING
from pymongo.errors import OperationFailure
from models.db import get_db


def _col():
    return get_db()["items"]


def create_indexes():
    """Create named indexes — safe to call repeatedly."""
    for spec, opts in [
        ([("name", ASCENDING)],        {"name": "idx_item_name"}),
        ([("quantity", ASCENDING)],     {"name": "idx_quantity"}),
        ([("created_at", DESCENDING)],  {"name": "idx_created_at"}),
    ]:
        try:
            _col().create_index(spec, **opts)
        except OperationFailure:
            pass


# ── CRUD ─────────────────────────────────────────────────────────────────────

def insert_item(
    name: str,
    quantity: int,
    description: str = "",
    author: str = "",
    image_url: str = "",
) -> str:
    now = datetime.datetime.utcnow()
    doc = {
        "name": name,
        "quantity": quantity,
        "description": description,
        "author": author,
        "image_url": image_url,
        "created_at": now,
        "updated_at": now,
    }
    result = _col().insert_one(doc)
    return str(result.inserted_id)


def find_all(page: int = 1, limit: int = 10) -> tuple[list, int]:
    """Return (items_list, total_count) for pagination."""
    skip = (page - 1) * limit
    total = _col().count_documents({})
    cursor = _col().find({}).sort("created_at", -1).skip(skip).limit(limit)
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
    """Update item fields. Automatically sets updated_at."""
    try:
        fields["updated_at"] = datetime.datetime.utcnow()
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


def count_low_stock(threshold: int = 5) -> int:
    """Count items with quantity below a threshold (for dashboard alerts)."""
    return _col().count_documents({"quantity": {"$lt": threshold}})


def total_stock_value() -> int:
    """Sum of all item quantities across the inventory."""
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$quantity"}}}]
    result = list(_col().aggregate(pipeline))
    return result[0]["total"] if result else 0


def serialize(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "quantity": doc.get("quantity", 0),
        "description": doc.get("description", ""),
        "author": doc.get("author", ""),
        "image_url": doc.get("image_url", ""),
        "created_at": doc.get("created_at", ""),
    }
