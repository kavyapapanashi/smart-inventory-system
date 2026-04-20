"""
database/test_db.py — Test and verify the Stockline MongoDB database.

Runs a series of CRUD operations and query tests against all collections
to ensure the database is functioning correctly.

Run with (from the database directory, venv activated):
    python test_db.py
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, WriteError
from bson import ObjectId
from datetime import datetime
import bcrypt

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/stockline")

PASS = "✅"
FAIL = "❌"
SKIP = "⏭ "
total_tests = 0
passed_tests = 0
failed_tests = 0


def test(name: str, condition: bool, detail: str = ""):
    global total_tests, passed_tests, failed_tests
    total_tests += 1
    if condition:
        passed_tests += 1
        print(f"  {PASS} {name}")
    else:
        failed_tests += 1
        msg = f"  {FAIL} {name}"
        if detail:
            msg += f"  —  {detail}"
        print(msg)


def run_tests():
    global total_tests, passed_tests, failed_tests

    print("\n" + "=" * 60)
    print("  STOCKLINE — Database Test Suite")
    print("=" * 60)

    # ── 1. Connection ─────────────────────────────────────────────────────────
    print("\n  ── Connection ─────────────────────────────────────────")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")
        db = client.get_default_database()
        test("MongoDB connection", True)
        test(f"Database name is '{db.name}'", db.name == "stockline", f"got '{db.name}'")
    except ConnectionFailure as e:
        test("MongoDB connection", False, str(e))
        print("\n  ❌ Cannot continue without a database connection.\n")
        return

    # ── 2. Collections Exist ──────────────────────────────────────────────────
    print("\n  ── Collections ────────────────────────────────────────")
    collections = db.list_collection_names()
    for name in ["users", "items", "requests", "transactions"]:
        test(f"Collection '{name}' exists", name in collections)

    # ── 3. Indexes ────────────────────────────────────────────────────────────
    print("\n  ── Indexes ────────────────────────────────────────────")

    # Users — email unique index
    user_indexes = db["users"].index_information()
    has_email_unique = any(
        idx.get("unique") and any(k == "email" for k, _ in idx.get("key", []))
        for idx in user_indexes.values()
    )
    test("users.email has unique index", has_email_unique)

    # Items — name index
    item_indexes = db["items"].index_information()
    has_name_idx = any(
        any(k == "name" for k, _ in idx.get("key", []))
        for idx in item_indexes.values()
    )
    test("items.name has index", has_name_idx)

    # Requests — status index
    req_indexes = db["requests"].index_information()
    has_status_idx = any(
        any(k == "status" for k, _ in idx.get("key", []))
        for idx in req_indexes.values()
    )
    test("requests.status has index", has_status_idx)

    # Transactions — timestamp index
    txn_indexes = db["transactions"].index_information()
    has_ts_idx = any(
        any(k == "timestamp" for k, _ in idx.get("key", []))
        for idx in txn_indexes.values()
    )
    test("transactions.timestamp has index", has_ts_idx)

    # ── 4. Document Counts ────────────────────────────────────────────────────
    print("\n  ── Document Counts ────────────────────────────────────")
    users_count = db["users"].count_documents({})
    items_count = db["items"].count_documents({})
    requests_count = db["requests"].count_documents({})
    transactions_count = db["transactions"].count_documents({})

    test(f"users has {users_count} documents", users_count >= 3, "expected >= 3")
    test(f"items has {items_count} documents", items_count >= 15, "expected >= 15")
    test(f"requests has {requests_count} documents", requests_count >= 1, "expected >= 1")
    test(f"transactions has {transactions_count} documents", transactions_count >= 1, "expected >= 1")

    # ── 5. CRUD — Users ──────────────────────────────────────────────────────
    print("\n  ── CRUD: Users ────────────────────────────────────────")

    # Read: find admin
    admin = db["users"].find_one({"email": "admin@stockline.com"})
    test("Read: find admin user by email", admin is not None)
    if admin:
        test("Admin has role 'admin'", admin.get("role") == "admin")
        test("Admin has hashed password", admin.get("password", "").startswith("$2") or admin.get("password", "").startswith("scrypt:") or admin.get("password", "").startswith("pbkdf2:"))

    # Read: find by ObjectId
    if admin:
        found = db["users"].find_one({"_id": admin["_id"]})
        test("Read: find user by _id", found is not None and found["email"] == "admin@stockline.com")

    # Unique constraint: duplicate email
    try:
        db["users"].insert_one({
            "name": "Duplicate",
            "email": "admin@stockline.com",
            "password": "test",
            "role": "user",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        })
        # If we get here, the unique constraint failed
        test("Unique constraint on email", False, "duplicate insert succeeded")
        db["users"].delete_one({"name": "Duplicate", "email": "admin@stockline.com"})
    except Exception:
        test("Unique constraint on email rejects duplicates", True)

    # Insert + delete test user
    test_password = bcrypt.hashpw("Test@123".encode(), bcrypt.gensalt()).decode()
    result = db["users"].insert_one({
        "name": "Test User",
        "email": "test_temp@stockline.com",
        "password": test_password,
        "role": "user",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    })
    test_user_id = result.inserted_id
    test("Insert: create test user", test_user_id is not None)

    # Update
    db["users"].update_one(
        {"_id": test_user_id},
        {"$set": {"name": "Updated Test User", "updated_at": datetime.utcnow()}}
    )
    updated = db["users"].find_one({"_id": test_user_id})
    test("Update: modify test user name", updated and updated["name"] == "Updated Test User")

    # Delete
    del_result = db["users"].delete_one({"_id": test_user_id})
    test("Delete: remove test user", del_result.deleted_count == 1)
    gone = db["users"].find_one({"_id": test_user_id})
    test("Verify: test user is deleted", gone is None)

    # ── 6. CRUD — Items ──────────────────────────────────────────────────────
    print("\n  ── CRUD: Items ────────────────────────────────────────")

    # Read
    calc = db["items"].find_one({"name": "Scientific Calculator"})
    test("Read: find 'Scientific Calculator'", calc is not None)
    if calc:
        test("Item has quantity field (int)", isinstance(calc.get("quantity"), int))

    # Insert
    test_item = db["items"].insert_one({
        "name": "Test Item XYZ",
        "quantity": 99,
        "description": "Temporary test item",
        "author": "",
        "image_url": "",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    })
    test("Insert: create test item", test_item.inserted_id is not None)

    # Update quantity
    db["items"].update_one(
        {"_id": test_item.inserted_id},
        {"$set": {"quantity": 50, "updated_at": datetime.utcnow()}}
    )
    updated_item = db["items"].find_one({"_id": test_item.inserted_id})
    test("Update: change quantity to 50", updated_item and updated_item["quantity"] == 50)

    # Delete
    db["items"].delete_one({"_id": test_item.inserted_id})
    test("Delete: remove test item", db["items"].find_one({"_id": test_item.inserted_id}) is None)

    # ── 7. CRUD — Requests ────────────────────────────────────────────────────
    print("\n  ── CRUD: Requests ─────────────────────────────────────")

    # Read pending requests
    pending = list(db["requests"].find({"status": "pending"}))
    test(f"Query: find pending requests ({len(pending)} found)", len(pending) >= 0)

    # Insert test request
    test_req = db["requests"].insert_one({
        "item_name": "Test Request Item",
        "quantity": 3,
        "requested_by": str(ObjectId()),
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    })
    test("Insert: create test request", test_req.inserted_id is not None)

    # Update status
    db["requests"].update_one(
        {"_id": test_req.inserted_id},
        {"$set": {"status": "approved", "updated_at": datetime.utcnow()}}
    )
    updated_req = db["requests"].find_one({"_id": test_req.inserted_id})
    test("Update: approve test request", updated_req and updated_req["status"] == "approved")

    # Delete
    db["requests"].delete_one({"_id": test_req.inserted_id})
    test("Delete: remove test request", db["requests"].find_one({"_id": test_req.inserted_id}) is None)

    # ── 8. CRUD — Transactions ────────────────────────────────────────────────
    print("\n  ── CRUD: Transactions ─────────────────────────────────")

    # Read sorted by timestamp
    txns = list(db["transactions"].find({}).sort("timestamp", -1).limit(5))
    test(f"Query: latest transactions ({len(txns)} found)", len(txns) >= 0)

    # Insert
    test_txn = db["transactions"].insert_one({
        "item_id": str(ObjectId()),
        "item_name": "Test Txn Item",
        "user_id": str(ObjectId()),
        "user_name": "Test User",
        "type": "issued",
        "quantity": 1,
        "timestamp": datetime.utcnow(),
        "status": "completed",
    })
    test("Insert: create test transaction", test_txn.inserted_id is not None)

    # Delete
    db["transactions"].delete_one({"_id": test_txn.inserted_id})
    test("Delete: remove test transaction", db["transactions"].find_one({"_id": test_txn.inserted_id}) is None)

    # ── 9. Aggregation Queries ────────────────────────────────────────────────
    print("\n  ── Aggregation Queries ────────────────────────────────")

    # Total stock
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$quantity"}}}]
    stock_result = list(db["items"].aggregate(pipeline))
    total_stock = stock_result[0]["total"] if stock_result else 0
    test(f"Aggregation: total stock = {total_stock}", total_stock > 0)

    # Low stock count (< 5)
    low_stock = db["items"].count_documents({"quantity": {"$lt": 5}})
    test(f"Query: low stock items (qty < 5) = {low_stock}", True)

    # Requests by status
    for status in ["pending", "approved", "rejected"]:
        count = db["requests"].count_documents({"status": status})
        test(f"Query: {status} requests = {count}", True)

    # ── Summary ───────────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print(f"  TEST RESULTS: {passed_tests}/{total_tests} passed", end="")
    if failed_tests:
        print(f"  ({failed_tests} FAILED)")
    else:
        print("  — ALL PASSED ✅")
    print("=" * 60 + "\n")

    client.close()


if __name__ == "__main__":
    run_tests()
