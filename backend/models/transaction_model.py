"""
models/transaction_model.py — Transactions collection helpers.
Tracks when items are issued or returned.

Collection: transactions
Fields:
    _id       : ObjectId  (auto-generated)
    item_id   : string    (required, references items._id)
    item_name : string    (required, denormalized for quick display)
    user_id   : string    (required, references users._id)
    user_name : string    (required, denormalized for quick display)
    type      : string    (required, "issued" | "returned")
    quantity  : int       (required, >= 1)
    timestamp : datetime  (required, when the transaction occurred)
    status    : string    ("completed" | "pending")
"""
import datetime
from bson import ObjectId
from pymongo import ASCENDING, DESCENDING
from pymongo.errors import OperationFailure
from models.db import get_db

TYPE_ISSUED = "issued"
TYPE_RETURNED = "returned"
STATUS_COMPLETED = "completed"
STATUS_PENDING = "pending"


def _col():
    return get_db()["transactions"]


def create_indexes():
    """Create named indexes — safe to call repeatedly."""
    for spec, opts in [
        ([("item_id", ASCENDING)],      {"name": "idx_item_id"}),
        ([("user_id", ASCENDING)],      {"name": "idx_user_id"}),
        ([("timestamp", DESCENDING)],   {"name": "idx_timestamp"}),
        ([("type", ASCENDING)],         {"name": "idx_type"}),
    ]:
        try:
            _col().create_index(spec, **opts)
        except OperationFailure:
            pass


# ── CRUD ─────────────────────────────────────────────────────────────────────

def insert_transaction(
    item_id: str, item_name: str,
    user_id: str, user_name: str,
    txn_type: str, quantity: int,
) -> str:
    doc = {
        "item_id": item_id,
        "item_name": item_name,
        "user_id": user_id,
        "user_name": user_name,
        "type": txn_type,
        "quantity": quantity,
        "timestamp": datetime.datetime.utcnow(),
        "status": STATUS_COMPLETED,
    }
    result = _col().insert_one(doc)
    return str(result.inserted_id)


def find_all(page: int = 1, limit: int = 10) -> tuple[list, int]:
    skip = (page - 1) * limit
    total = _col().count_documents({})
    cursor = _col().find({}).sort("timestamp", -1).skip(skip).limit(limit)
    return [serialize(doc) for doc in cursor], total


def find_all_raw() -> list:
    """Return all transactions (no pagination) — used for PDF/CSV export."""
    cursor = _col().find({}).sort("timestamp", -1)
    return [serialize(doc) for doc in cursor]


def find_by_item(item_id: str) -> list:
    cursor = _col().find({"item_id": item_id}).sort("timestamp", -1)
    return [serialize(doc) for doc in cursor]


def find_by_user(user_id: str) -> list:
    """Return all transactions for a specific user."""
    cursor = _col().find({"user_id": user_id}).sort("timestamp", -1)
    return [serialize(doc) for doc in cursor]


def count_by_type(txn_type: str) -> int:
    """Count transactions of a given type (for dashboard stats)."""
    return _col().count_documents({"type": txn_type})


def serialize(doc: dict) -> dict:
    ts = doc.get("timestamp")
    return {
        "id": str(doc["_id"]),
        "item_id": doc.get("item_id", ""),
        "item_name": doc.get("item_name", ""),
        "user_id": doc.get("user_id", ""),
        "user_name": doc.get("user_name", ""),
        "type": doc.get("type", TYPE_ISSUED),
        "quantity": doc.get("quantity", 0),
        "timestamp": ts.strftime("%Y-%m-%d %H:%M") if ts else "",
        "status": doc.get("status", STATUS_COMPLETED),
    }
