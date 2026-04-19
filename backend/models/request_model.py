"""
models/request_model.py — Stock-request collection helpers.
"""
from bson import ObjectId
from models.db import get_db

STATUS_PENDING = "pending"
STATUS_APPROVED = "approved"
STATUS_REJECTED = "rejected"


def _col():
    return get_db()["requests"]


def create_indexes():
    _col().create_index("status")
    _col().create_index("requested_by")


# ── CRUD ─────────────────────────────────────────────────────────────────────

def insert_request(item_name: str, quantity: int, requested_by: str) -> str:
    doc = {
        "item_name": item_name,
        "quantity": quantity,
        "requested_by": requested_by,
        "status": STATUS_PENDING,
    }
    result = _col().insert_one(doc)
    return str(result.inserted_id)


def find_all(page: int = 1, limit: int = 10) -> tuple[list, int]:
    skip = (page - 1) * limit
    total = _col().count_documents({})
    cursor = _col().find({}).skip(skip).limit(limit)
    return [serialize(doc) for doc in cursor], total


def find_by_id(request_id: str) -> dict | None:
    try:
        doc = _col().find_one({"_id": ObjectId(request_id)})
        return serialize(doc) if doc else None
    except Exception:
        return None


def update_status(request_id: str, status: str) -> bool:
    try:
        result = _col().update_one(
            {"_id": ObjectId(request_id)}, {"$set": {"status": status}}
        )
        return result.matched_count > 0
    except Exception:
        return False


def serialize(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "item_name": doc.get("item_name", ""),
        "quantity": doc.get("quantity", 0),
        "requested_by": doc.get("requested_by", ""),
        "status": doc.get("status", STATUS_PENDING),
    }
