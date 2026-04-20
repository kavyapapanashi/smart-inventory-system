"""
models/user.py — User collection helpers.

Collection: users
Fields:
    _id        : ObjectId  (auto-generated)
    name       : string    (required, 1-100 chars)
    email      : string    (required, unique, valid email format)
    password   : string    (required, bcrypt-hashed)
    role       : string    (required, "admin" | "user")
    created_at : datetime  (auto-set on insert)
    updated_at : datetime  (auto-set on insert & update)
"""
import datetime
from bson import ObjectId
from pymongo import ASCENDING, DESCENDING
from pymongo.errors import OperationFailure
from models.db import get_db


VALID_ROLES = {"admin", "user"}


def _col():
    return get_db()["users"]


def create_indexes():
    """Create named indexes — safe to call repeatedly."""
    try:
        _col().create_index([("email", ASCENDING)], unique=True, name="idx_email_unique")
    except OperationFailure:
        pass  # index already exists with same name/options
    try:
        _col().create_index([("role", ASCENDING)], name="idx_role")
    except OperationFailure:
        pass
    try:
        _col().create_index([("created_at", DESCENDING)], name="idx_created_at")
    except OperationFailure:
        pass


# ── CRUD ─────────────────────────────────────────────────────────────────────

def insert_user(name: str, email: str, hashed_password: str, role: str) -> str:
    """Insert a new user and return the string _id."""
    now = datetime.datetime.utcnow()
    doc = {
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": role,
        "created_at": now,
        "updated_at": now,
    }
    result = _col().insert_one(doc)
    return str(result.inserted_id)


def find_by_email(email: str) -> dict | None:
    return _col().find_one({"email": email})


def find_by_id(user_id: str) -> dict | None:
    try:
        return _col().find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


def find_all(page: int = 1, limit: int = 10) -> tuple[list, int]:
    """Return (users_list, total_count) for pagination."""
    skip = (page - 1) * limit
    total = _col().count_documents({})
    cursor = _col().find({}).sort("created_at", -1).skip(skip).limit(limit)
    return [serialize(doc) for doc in cursor], total


def update_user(user_id: str, fields: dict) -> bool:
    """Update user fields. Automatically sets updated_at."""
    try:
        fields["updated_at"] = datetime.datetime.utcnow()
        result = _col().update_one(
            {"_id": ObjectId(user_id)}, {"$set": fields}
        )
        return result.matched_count > 0
    except Exception:
        return False


def delete_user(user_id: str) -> bool:
    try:
        result = _col().delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
    except Exception:
        return False


def email_exists(email: str) -> bool:
    return _col().count_documents({"email": email}, limit=1) > 0


def count_by_role(role: str) -> int:
    """Count users with a given role."""
    return _col().count_documents({"role": role})


def serialize(user: dict) -> dict:
    """Strip password and convert ObjectId before sending over the wire."""
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user.get("created_at", ""),
    }
