"""
models/user.py — User collection helpers.
"""
from bson import ObjectId
from models.db import get_db


VALID_ROLES = {"admin", "user"}


def _col():
    return get_db()["users"]


def create_indexes():
    _col().create_index("email", unique=True)


# ── CRUD ─────────────────────────────────────────────────────────────────────

def insert_user(name: str, email: str, hashed_password: str, role: str) -> str:
    """Insert a new user and return the string _id."""
    doc = {
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": role,
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


def email_exists(email: str) -> bool:
    return _col().count_documents({"email": email}, limit=1) > 0


def serialize(user: dict) -> dict:
    """Strip password and convert ObjectId before sending over the wire."""
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
    }
