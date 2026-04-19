"""
models/db.py — Single MongoDB connection shared across the app.
"""
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import logging
from config import Config

logger = logging.getLogger(__name__)

_client: MongoClient | None = None
_db = None


def get_db():
    """Return the database instance, creating the connection on first call."""
    global _client, _db
    if _db is None:
        try:
            _client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)
            # Force a connection attempt to detect errors early
            _client.admin.command("ping")
            _db = _client.get_default_database()
            logger.info("✅  Connected to MongoDB at %s", Config.MONGO_URI)
        except ConnectionFailure as exc:
            logger.critical("❌  Could not connect to MongoDB: %s", exc)
            raise
    return _db


def close_db():
    """Close the MongoDB connection (call on app teardown)."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        logger.info("MongoDB connection closed.")
