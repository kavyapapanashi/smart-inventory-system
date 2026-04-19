"""
seed.py — Populate the stockline database with sample data.

Run with (venv activated):
    python seed.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))  # make sure imports resolve

from dotenv import load_dotenv
load_dotenv()

from werkzeug.security import generate_password_hash
from models.db import get_db
from datetime import datetime

db = get_db()

# ── 1. Users ─────────────────────────────────────────────────────────────────

users_col = db["users"]

sample_users = [
    {
        "name": "Admin User",
        "email": "admin@stockline.com",
        "password": generate_password_hash("Admin@123"),
        "role": "admin",
    },
    {
        "name": "John Doe",
        "email": "john@stockline.com",
        "password": generate_password_hash("User@123"),
        "role": "user",
    },
    {
        "name": "Jane Smith",
        "email": "jane@stockline.com",
        "password": generate_password_hash("User@123"),
        "role": "user",
    },
]

inserted_users = 0
for u in sample_users:
    if not users_col.find_one({"email": u["email"]}):
        users_col.insert_one(u)
        inserted_users += 1
        print(f"  ✅ User created  : {u['name']} ({u['email']}) — role: {u['role']}")
    else:
        print(f"  ⏭  Already exists: {u['email']}")

print(f"\n  Users inserted: {inserted_users}\n")


# ── 2. Inventory Items ────────────────────────────────────────────────────────

items_col = db["items"]

sample_items = [
    {"name": "GMIT Record Book",          "quantity": 2,   "description": "Official GMIT record book for academic records"},
    {"name": "Engineering Drawing Kit",   "quantity": 5,   "description": "Full set: compass, protractor, set squares"},
    {"name": "A4 Copy Paper (Ream)",       "quantity": 8,   "description": "500 sheets per ream, 80 gsm"},
    {"name": "Advanced Mathematics",       "quantity": 45,  "description": "Textbook – 3rd year B.Tech reference"},
    {"name": "Physics Lab Manual",         "quantity": 32,  "description": "Practical manual for Physics lab sessions"},
    {"name": "CS Data Structures",         "quantity": 28,  "description": "Data Structures & Algorithms – CS dept"},
    {"name": "Blue Ball Pen (Box)",        "quantity": 60,  "description": "Box of 10 Reynolds pens"},
    {"name": "Scientific Calculator",     "quantity": 15,  "description": "Casio FX-991ES Plus"},
    {"name": "Graph Paper Pad",            "quantity": 20,  "description": "A4 graph paper, 50 sheets per pad"},
    {"name": "Lab Coat (Medium)",          "quantity": 10,  "description": "White cotton lab coat, size M"},
    {"name": "Lab Coat (Large)",           "quantity": 7,   "description": "White cotton lab coat, size L"},
    {"name": "Whiteboard Marker Set",      "quantity": 25,  "description": "4 colours: black, blue, red, green"},
    {"name": "Stapler",                    "quantity": 12,  "description": "Full-strip stapler with staples"},
    {"name": "Sticky Notes (Pack)",        "quantity": 30,  "description": "3x3 inch, 100 sheets per pack"},
    {"name": "USB Flash Drive 32GB",       "quantity": 18,  "description": "SanDisk USB 3.0"},
]

inserted_items = 0
for item in sample_items:
    if not items_col.find_one({"name": item["name"]}):
        items_col.insert_one(item)
        inserted_items += 1
        print(f"  ✅ Item added : {item['name']}  (qty: {item['quantity']})")
    else:
        print(f"  ⏭  Already exists: {item['name']}")

print(f"\n  Items inserted: {inserted_items}\n")


# ── Summary ───────────────────────────────────────────────────────────────────
print("=" * 50)
print(f"  Seed complete!")
print(f"  Total users in DB : {users_col.count_documents({})}")
print(f"  Total items in DB : {items_col.count_documents({})}")
print("=" * 50)
print("\n  Login credentials:")
print("  Admin → admin@stockline.com  / Admin@123")
print("  User  → john@stockline.com   / User@123")
print("  User  → jane@stockline.com   / User@123\n")
