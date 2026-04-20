"""
models/request_model.py — Stock-request collection helpers.

Collection: requests
Fields:
    _id          : ObjectId  (auto-generated)
    item_name    : string    (required, name of the requested item)
    quantity     : int       (required, >= 1)
    requested_by : string    (required, user_id of requester)
    status       : string    (required, "pending" | "approved" | "rejected")
    created_at   : datetime  (auto-set on insert)
    updated_at   : datetime  (auto-set on insert & status change)
"""
import datetime
from bson import ObjectId
from pymongo import ASCENDING, DESCENDING
from pymongo.errors import OperationFailure
from models.db import get_db

STATUS_PENDING = "pending"
STATUS_APPROVED = "approved"
STATUS_REJECTED = "rejected"
VALID_STATUSES = {STATUS_PENDING, STATUS_APPROVED, STATUS_REJECTED}


def _col():
    return get_db()["requests"]


def create_indexes():
    """Create named indexes — safe to call repeatedly."""
    for spec, opts in [
        ([("item_name", ASCENDING)],    {"name": "idx_item_name"}),
        ([("status", ASCENDING)],        {"name": "idx_status"}),
        ([("requested_by", ASCENDING)],  {"name": "idx_requested_by"}),
        ([("created_at", DESCENDING)],   {"name": "idx_created_at"}),
    ]:
        try:
            _col().create_index(spec, **opts)
        except OperationFailure:
            pass


# ── CRUD ─────────────────────────────────────────────────────────────────────

def insert_request(item_name: str, quantity: int, requested_by: str) -> str:
    now = datetime.datetime.utcnow()
    doc = {
        "item_name": item_name,
        "quantity": quantity,
        "requested_by": requested_by,
        "status": STATUS_PENDING,
        "created_at": now,
        "updated_at": now,
    }
    result = _col().insert_one(doc)
    return str(result.inserted_id)


def find_all(page: int = 1, limit: int = 10) -> tuple[list, int]:
    skip = (page - 1) * limit
    total = _col().count_documents({})
    cursor = _col().find({}).sort("created_at", -1).skip(skip).limit(limit)
    return [serialize(doc) for doc in cursor], total


def find_by_user(user_id: str, page: int = 1, limit: int = 10) -> tuple[list, int]:
    """Return requests for a specific user (paginated)."""
    skip = (page - 1) * limit
    query = {"requested_by": user_id}
    total = _col().count_documents(query)
    cursor = _col().find(query).sort("created_at", -1).skip(skip).limit(limit)
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
            {"_id": ObjectId(request_id)},
            {"$set": {"status": status, "updated_at": datetime.datetime.utcnow()}},
        )
        return result.matched_count > 0
    except Exception:
        return False


def count_by_status(status: str) -> int:
    """Count requests with a given status (for dashboard stats)."""
    return _col().count_documents({"status": status})


def serialize(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "item_name": doc.get("item_name", ""),
        "quantity": doc.get("quantity", 0),
        "requested_by": doc.get("requested_by", ""),
        "status": doc.get("status", STATUS_PENDING),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }
