"""
database/init_db.py — Initialize the Stockline MongoDB database.

Creates collections with JSON Schema validation, indexes, and verifies setup.

Run with (from the backend directory, venv activated):
    python ../database/init_db.py
Or from the database directory:
    python init_db.py

Prerequisites:
    - MongoDB server running on localhost:27017
    - pip install pymongo python-dotenv
"""

import sys
import os

# Allow running from either the database/ or backend/ directory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import CollectionInvalid, ConnectionFailure, OperationFailure
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/stockline")


# ══════════════════════════════════════════════════════════════════════════════
# Schema Validation Rules (MongoDB JSON Schema)
# ══════════════════════════════════════════════════════════════════════════════

USERS_VALIDATOR = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["name", "email", "password", "role"],
        "properties": {
            "name": {
                "bsonType": "string",
                "minLength": 1,
                "maxLength": 100,
                "description": "Full name of the user — required",
            },
            "email": {
                "bsonType": "string",
                "pattern": r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
                "description": "Valid email address — required, unique",
            },
            "password": {
                "bsonType": "string",
                "minLength": 1,
                "description": "Bcrypt-hashed password — required",
            },
            "role": {
                "bsonType": "string",
                "enum": ["admin", "user"],
                "description": "User role — must be 'admin' or 'user'",
            },
            "created_at": {
                "bsonType": "date",
                "description": "Timestamp when the user was created",
            },
            "updated_at": {
                "bsonType": "date",
                "description": "Timestamp when the user was last updated",
            },
        },
    }
}

ITEMS_VALIDATOR = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["name", "quantity"],
        "properties": {
            "name": {
                "bsonType": "string",
                "minLength": 1,
                "maxLength": 200,
                "description": "Item name — required",
            },
            "quantity": {
                "bsonType": "int",
                "minimum": 0,
                "description": "Available stock count — required, non-negative integer",
            },
            "description": {
                "bsonType": "string",
                "maxLength": 1000,
                "description": "Optional item description",
            },
            "author": {
                "bsonType": "string",
                "maxLength": 200,
                "description": "Optional author / supplier name",
            },
            "image_url": {
                "bsonType": "string",
                "description": "Optional URL or path to item image",
            },
            "created_at": {
                "bsonType": "date",
                "description": "Timestamp when the item was added",
            },
            "updated_at": {
                "bsonType": "date",
                "description": "Timestamp when the item was last updated",
            },
        },
    }
}

REQUESTS_VALIDATOR = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["item_name", "quantity", "requested_by", "status"],
        "properties": {
            "item_name": {
                "bsonType": "string",
                "minLength": 1,
                "description": "Name of the requested item — required",
            },
            "quantity": {
                "bsonType": "int",
                "minimum": 1,
                "description": "Requested quantity — required, positive integer",
            },
            "requested_by": {
                "bsonType": "string",
                "minLength": 1,
                "description": "User ID of the requester — required",
            },
            "status": {
                "bsonType": "string",
                "enum": ["pending", "approved", "rejected"],
                "description": "Request status — must be 'pending', 'approved', or 'rejected'",
            },
            "created_at": {
                "bsonType": "date",
                "description": "Timestamp when the request was created",
            },
            "updated_at": {
                "bsonType": "date",
                "description": "Timestamp when the request was last updated",
            },
        },
    }
}

TRANSACTIONS_VALIDATOR = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["item_id", "item_name", "user_id", "user_name", "type", "quantity", "timestamp"],
        "properties": {
            "item_id": {
                "bsonType": "string",
                "description": "ObjectId (string) of the inventory item — required",
            },
            "item_name": {
                "bsonType": "string",
                "description": "Name of the inventory item — required",
            },
            "user_id": {
                "bsonType": "string",
                "description": "ObjectId (string) of the user — required",
            },
            "user_name": {
                "bsonType": "string",
                "description": "Name of the user — required",
            },
            "type": {
                "bsonType": "string",
                "enum": ["issued", "returned"],
                "description": "Transaction type — 'issued' or 'returned'",
            },
            "quantity": {
                "bsonType": "int",
                "minimum": 1,
                "description": "Quantity issued or returned — required",
            },
            "timestamp": {
                "bsonType": "date",
                "description": "When the transaction occurred — required",
            },
            "status": {
                "bsonType": "string",
                "enum": ["completed", "pending"],
                "description": "Transaction status — 'completed' or 'pending'",
            },
        },
    }
}


# ══════════════════════════════════════════════════════════════════════════════
# Collection & Index Definitions
# ══════════════════════════════════════════════════════════════════════════════

COLLECTIONS = {
    "users": {
        "validator": USERS_VALIDATOR,
        "validationLevel": "moderate",      # allows existing docs that don't match
        "validationAction": "error",        # reject invalid inserts/updates
        "indexes": [
            {"keys": [("email", ASCENDING)], "unique": True, "name": "idx_email_unique"},
            {"keys": [("role", ASCENDING)], "unique": False, "name": "idx_role"},
            {"keys": [("created_at", DESCENDING)], "unique": False, "name": "idx_created_at"},
        ],
    },
    "items": {
        "validator": ITEMS_VALIDATOR,
        "validationLevel": "moderate",
        "validationAction": "error",
        "indexes": [
            {"keys": [("name", ASCENDING)], "unique": False, "name": "idx_item_name"},
            {"keys": [("quantity", ASCENDING)], "unique": False, "name": "idx_quantity"},
            {"keys": [("created_at", DESCENDING)], "unique": False, "name": "idx_created_at"},
        ],
    },
    "requests": {
        "validator": REQUESTS_VALIDATOR,
        "validationLevel": "moderate",
        "validationAction": "error",
        "indexes": [
            {"keys": [("item_name", ASCENDING)], "unique": False, "name": "idx_item_name"},
            {"keys": [("status", ASCENDING)], "unique": False, "name": "idx_status"},
            {"keys": [("requested_by", ASCENDING)], "unique": False, "name": "idx_requested_by"},
            {"keys": [("created_at", DESCENDING)], "unique": False, "name": "idx_created_at"},
        ],
    },
    "transactions": {
        "validator": TRANSACTIONS_VALIDATOR,
        "validationLevel": "moderate",
        "validationAction": "error",
        "indexes": [
            {"keys": [("item_id", ASCENDING)], "unique": False, "name": "idx_item_id"},
            {"keys": [("user_id", ASCENDING)], "unique": False, "name": "idx_user_id"},
            {"keys": [("timestamp", DESCENDING)], "unique": False, "name": "idx_timestamp"},
            {"keys": [("type", ASCENDING)], "unique": False, "name": "idx_type"},
        ],
    },
}


# ══════════════════════════════════════════════════════════════════════════════
# Initialization Logic
# ══════════════════════════════════════════════════════════════════════════════

def connect(uri: str):
    """Connect to MongoDB and return the database handle."""
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")
        db = client.get_default_database()
        logger.info("✅  Connected to MongoDB — database: '%s'", db.name)
        return client, db
    except ConnectionFailure as exc:
        logger.critical("❌  Could not connect to MongoDB: %s", exc)
        sys.exit(1)


def create_collection(db, name: str, config: dict):
    """Create a collection with validation, or update validation if it already exists."""
    try:
        db.create_collection(name)
        logger.info("  📦 Created collection: '%s'", name)
    except CollectionInvalid:
        logger.info("  📦 Collection '%s' already exists — updating validation", name)

    # Apply / update validator
    db.command({
        "collMod": name,
        "validator": config["validator"],
        "validationLevel": config.get("validationLevel", "moderate"),
        "validationAction": config.get("validationAction", "error"),
    })
    logger.info("     ✔ Validation rules applied")


def create_indexes(db, name: str, indexes: list):
    """Create indexes for a collection, handling pre-existing index name conflicts."""
    col = db[name]
    for idx in indexes:
        try:
            col.create_index(
                idx["keys"],
                unique=idx.get("unique", False),
                name=idx.get("name"),
            )
        except OperationFailure as e:
            if e.code == 85:  # IndexOptionsConflict — same keys, different name
                # Find and drop the conflicting index, then recreate
                key_tuple = tuple((k, d) for k, d in idx["keys"])
                existing = col.index_information()
                for existing_name, existing_info in existing.items():
                    existing_keys = tuple(tuple(k) for k in existing_info.get("key", []))
                    if existing_keys == key_tuple and existing_name != "_id_":
                        col.drop_index(existing_name)
                        logger.info("     ♻  Dropped conflicting index: %s", existing_name)
                        break
                # Retry creation
                col.create_index(
                    idx["keys"],
                    unique=idx.get("unique", False),
                    name=idx.get("name"),
                )
            else:
                raise
        key_desc = ", ".join(f"{k}:{d}" for k, d in idx["keys"])
        unique_tag = " (UNIQUE)" if idx.get("unique") else ""
        logger.info("     🔑 Index: %s%s", key_desc, unique_tag)


def verify_setup(db):
    """Print a summary of all collections, document counts, and indexes."""
    print("\n" + "=" * 60)
    print("  DATABASE VERIFICATION — '%s'" % db.name)
    print("=" * 60)

    collection_names = db.list_collection_names()
    for name in sorted(collection_names):
        if name.startswith("system."):
            continue
        col = db[name]
        count = col.count_documents({})
        indexes = col.index_information()
        print(f"\n  📁 {name}")
        print(f"     Documents : {count}")
        print(f"     Indexes   : {len(indexes)}")
        for idx_name, idx_info in indexes.items():
            keys = idx_info.get("key", [])
            unique = " (UNIQUE)" if idx_info.get("unique") else ""
            print(f"       • {idx_name}: {keys}{unique}")

    # Verify validation rules
    print("\n" + "-" * 60)
    print("  VALIDATION RULES")
    print("-" * 60)
    for name in ["users", "items", "requests", "transactions"]:
        if name in collection_names:
            info = db.command({"listCollections": 1, "filter": {"name": name}})
            for c in info.get("cursor", {}).get("firstBatch", []):
                opts = c.get("options", {})
                has_validator = "validator" in opts
                level = opts.get("validationLevel", "off")
                action = opts.get("validationAction", "warn")
                status = "✅" if has_validator else "⚠️"
                print(f"  {status} {name}: level={level}, action={action}")

    print("\n" + "=" * 60)
    print("  ✅  Database setup verified successfully!")
    print("=" * 60 + "\n")


def init_database():
    """Main initialization routine."""
    print("\n" + "=" * 60)
    print("  STOCKLINE — MongoDB Database Initialization")
    print("=" * 60 + "\n")

    client, db = connect(MONGO_URI)

    for name, config in COLLECTIONS.items():
        create_collection(db, name, config)
        create_indexes(db, name, config.get("indexes", []))
        print()

    verify_setup(db)
    client.close()


if __name__ == "__main__":
    init_database()
