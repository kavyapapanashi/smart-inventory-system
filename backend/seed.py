"""
seed.py — Populate the stockline database with sample data.

Inserts sample users, inventory items, requests, and transactions.

Run with (venv activated, from the backend directory):
    python seed.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))  # make sure imports resolve

from dotenv import load_dotenv
load_dotenv()

import bcrypt
from models.db import get_db
from datetime import datetime

db = get_db()


# ══════════════════════════════════════════════════════════════════════════════
# 1. USERS
# ══════════════════════════════════════════════════════════════════════════════

users_col = db["users"]

sample_users = [
    {
        "name": "Admin User",
        "email": "admin@stockline.com",
        "password": bcrypt.hashpw("Admin@123".encode(), bcrypt.gensalt()).decode(),
        "role": "admin",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
    {
        "name": "John Doe",
        "email": "john@stockline.com",
        "password": bcrypt.hashpw("User@123".encode(), bcrypt.gensalt()).decode(),
        "role": "user",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
    {
        "name": "Jane Smith",
        "email": "jane@stockline.com",
        "password": bcrypt.hashpw("User@123".encode(), bcrypt.gensalt()).decode(),
        "role": "user",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
]

print("\n" + "=" * 55)
print("  STOCKLINE — Seeding Database")
print("=" * 55)

print("\n  ── Users ──────────────────────────────────────────────")
inserted_users = 0
user_ids = {}  # email → ObjectId (for linking requests/transactions)

for u in sample_users:
    existing = users_col.find_one({"email": u["email"]})
    if not existing:
        result = users_col.insert_one(u)
        user_ids[u["email"]] = str(result.inserted_id)
        inserted_users += 1
        print(f"  ✅ Created  : {u['name']} ({u['email']}) — role: {u['role']}")
    else:
        user_ids[u["email"]] = str(existing["_id"])
        print(f"  ⏭  Exists   : {u['email']}")

print(f"\n     Users inserted: {inserted_users}")


# ══════════════════════════════════════════════════════════════════════════════
# 2. INVENTORY ITEMS
# ══════════════════════════════════════════════════════════════════════════════

items_col = db["items"]

sample_items = [
    {"name": "GMIT Record Book",        "quantity": 2,   "description": "Official GMIT record book for academic records"},
    {"name": "Engineering Drawing Kit",  "quantity": 5,   "description": "Full set: compass, protractor, set squares"},
    {"name": "A4 Copy Paper (Ream)",     "quantity": 8,   "description": "500 sheets per ream, 80 gsm"},
    {"name": "Advanced Mathematics",     "quantity": 45,  "description": "Textbook – 3rd year B.Tech reference"},
    {"name": "Physics Lab Manual",       "quantity": 32,  "description": "Practical manual for Physics lab sessions"},
    {"name": "CS Data Structures",       "quantity": 28,  "description": "Data Structures & Algorithms – CS dept"},
    {"name": "Blue Ball Pen (Box)",      "quantity": 60,  "description": "Box of 10 Reynolds pens"},
    {"name": "Scientific Calculator",    "quantity": 15,  "description": "Casio FX-991ES Plus"},
    {"name": "Graph Paper Pad",          "quantity": 20,  "description": "A4 graph paper, 50 sheets per pad"},
    {"name": "Lab Coat (Medium)",        "quantity": 10,  "description": "White cotton lab coat, size M"},
    {"name": "Lab Coat (Large)",         "quantity": 7,   "description": "White cotton lab coat, size L"},
    {"name": "Whiteboard Marker Set",    "quantity": 25,  "description": "4 colours: black, blue, red, green"},
    {"name": "Stapler",                  "quantity": 12,  "description": "Full-strip stapler with staples"},
    {"name": "Sticky Notes (Pack)",      "quantity": 30,  "description": "3x3 inch, 100 sheets per pack"},
    {"name": "USB Flash Drive 32GB",     "quantity": 18,  "description": "SanDisk USB 3.0"},
]

print("\n  ── Items ──────────────────────────────────────────────")
inserted_items = 0
item_map = {}  # name → ObjectId (for linking transactions)

for item in sample_items:
    existing = items_col.find_one({"name": item["name"]})
    if not existing:
        doc = {
            **item,
            "author": "",
            "image_url": "",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        result = items_col.insert_one(doc)
        item_map[item["name"]] = str(result.inserted_id)
        inserted_items += 1
        print(f"  ✅ Added    : {item['name']}  (qty: {item['quantity']})")
    else:
        item_map[item["name"]] = str(existing["_id"])
        print(f"  ⏭  Exists   : {item['name']}")

print(f"\n     Items inserted: {inserted_items}")


# ══════════════════════════════════════════════════════════════════════════════
# 3. REQUESTS
# ══════════════════════════════════════════════════════════════════════════════

requests_col = db["requests"]

john_id = user_ids.get("john@stockline.com", "")
jane_id = user_ids.get("jane@stockline.com", "")

sample_requests = [
    {
        "item_name": "GMIT Record Book",
        "quantity": 1,
        "requested_by": john_id,
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
    {
        "item_name": "Engineering Drawing Kit",
        "quantity": 2,
        "requested_by": john_id,
        "status": "approved",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
    {
        "item_name": "Scientific Calculator",
        "quantity": 1,
        "requested_by": jane_id,
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
    {
        "item_name": "Lab Coat (Medium)",
        "quantity": 1,
        "requested_by": jane_id,
        "status": "rejected",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
    {
        "item_name": "A4 Copy Paper (Ream)",
        "quantity": 3,
        "requested_by": john_id,
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
]

print("\n  ── Requests ───────────────────────────────────────────")
inserted_requests = 0

# Only insert if the collection is empty (avoid duplicating on re-runs)
if requests_col.count_documents({}) == 0:
    for req in sample_requests:
        requests_col.insert_one(req)
        inserted_requests += 1
        print(f"  ✅ Created  : {req['item_name']} (qty: {req['quantity']}) — {req['status']}")
else:
    print(f"  ⏭  Requests already exist ({requests_col.count_documents({})} docs) — skipping")

print(f"\n     Requests inserted: {inserted_requests}")


# ══════════════════════════════════════════════════════════════════════════════
# 4. TRANSACTIONS
# ══════════════════════════════════════════════════════════════════════════════

transactions_col = db["transactions"]

sample_transactions = [
    {
        "item_id": item_map.get("Engineering Drawing Kit", ""),
        "item_name": "Engineering Drawing Kit",
        "user_id": john_id,
        "user_name": "John Doe",
        "type": "issued",
        "quantity": 2,
        "timestamp": datetime.utcnow(),
        "status": "completed",
    },
    {
        "item_id": item_map.get("Blue Ball Pen (Box)", ""),
        "item_name": "Blue Ball Pen (Box)",
        "user_id": jane_id,
        "user_name": "Jane Smith",
        "type": "issued",
        "quantity": 1,
        "timestamp": datetime.utcnow(),
        "status": "completed",
    },
    {
        "item_id": item_map.get("Scientific Calculator", ""),
        "item_name": "Scientific Calculator",
        "user_id": john_id,
        "user_name": "John Doe",
        "type": "returned",
        "quantity": 1,
        "timestamp": datetime.utcnow(),
        "status": "completed",
    },
]

print("\n  ── Transactions ───────────────────────────────────────")
inserted_transactions = 0

if transactions_col.count_documents({}) == 0:
    for txn in sample_transactions:
        transactions_col.insert_one(txn)
        inserted_transactions += 1
        print(f"  ✅ Created  : {txn['type']} {txn['item_name']} → {txn['user_name']}")
else:
    print(f"  ⏭  Transactions already exist ({transactions_col.count_documents({})} docs) — skipping")

print(f"\n     Transactions inserted: {inserted_transactions}")


# ══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ══════════════════════════════════════════════════════════════════════════════

print("\n" + "=" * 55)
print("  ✅  Seed complete!")
print("=" * 55)
print(f"  Total users        : {users_col.count_documents({})}")
print(f"  Total items        : {items_col.count_documents({})}")
print(f"  Total requests     : {requests_col.count_documents({})}")
print(f"  Total transactions : {transactions_col.count_documents({})}")
print("=" * 55)
print("\n  Login credentials:")
print("  Admin → admin@stockline.com  / Admin@123")
print("  User  → john@stockline.com   / User@123")
print("  User  → jane@stockline.com   / User@123\n")
