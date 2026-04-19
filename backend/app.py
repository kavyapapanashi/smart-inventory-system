"""
app.py — Flask application entry point.

Run with:
    python app.py
Or via Flask CLI:
    flask run --port 5000
"""
import logging
import logging.config
from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from config import Config
from models.db import get_db, close_db
from models import user as user_model
from models import item as item_model
from models import request_model
from models import transaction_model

from routes.auth import auth_bp
from routes.inventory import inventory_bp
from routes.request import request_bp
from routes.transactions import transactions_bp
from routes.users_route import users_bp
from routes.reports import reports_bp


# ── Logging Setup ─────────────────────────────────────────────────────────────

logging.config.dictConfig({
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
        },
        "file": {
            "class": "logging.FileHandler",
            "filename": "stockline.log",
            "formatter": "standard",
            "encoding": "utf-8",
        },
    },
    "root": {
        "level": "DEBUG" if Config.DEBUG else "INFO",
        "handlers": ["console", "file"],
    },
})

logger = logging.getLogger(__name__)


# ── App Factory ───────────────────────────────────────────────────────────────

def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    # ── CORS ──────────────────────────────────────────────────────────────────
    CORS(
        app,
        origins=Config.CORS_ORIGINS,
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )

    # ── Rate Limiting ─────────────────────────────────────────────────────────
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=[Config.RATELIMIT_DEFAULT],
        storage_uri=Config.RATELIMIT_STORAGE_URL,
    )
    # Tighter limit on auth endpoints to prevent brute-force
    limiter.limit("10 per minute")(auth_bp)

    # ── Database Init ─────────────────────────────────────────────────────────
    with app.app_context():
        get_db()                  # Verify connection at startup
        user_model.create_indexes()
        item_model.create_indexes()
        request_model.create_indexes()
        transaction_model.create_indexes()

    # ── Blueprints ────────────────────────────────────────────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(request_bp)
    app.register_blueprint(transactions_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(reports_bp)

    # ── Teardown ──────────────────────────────────────────────────────────────
    @app.teardown_appcontext
    def shutdown_db(exception=None):
        close_db()

    # ── Health Check ──────────────────────────────────────────────────────────
    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "service": "Stockline Backend"}), 200

    # ── Global Error Handlers ─────────────────────────────────────────────────
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad request", "detail": str(e)}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"error": "Unauthorized"}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({"error": "Forbidden"}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "Method not allowed"}), 405

    @app.errorhandler(429)
    def rate_limited(e):
        return jsonify({"error": "Too many requests. Please slow down."}), 429

    @app.errorhandler(500)
    def internal_error(e):
        logger.exception("Internal server error: %s", e)
        return jsonify({"error": "Internal server error"}), 500

    logger.info("🚀  Stockline backend ready | debug=%s", Config.DEBUG)
    return app


# ── Entry Point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    flask_app = create_app()
    flask_app.run(
        host="0.0.0.0",
        port=Config.PORT,
        debug=Config.DEBUG,
    )
