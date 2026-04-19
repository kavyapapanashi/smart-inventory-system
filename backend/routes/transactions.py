"""
routes/transactions.py — Transaction log endpoints.

POST /transactions              → Log a new transaction (authenticated)
GET  /transactions              → List transactions (paginated, authenticated)
GET  /transactions/export/csv  → Download CSV (admin)
GET  /transactions/export/pdf  → Download PDF (admin)
"""
import csv
import io
import logging
from flask import Blueprint, request, jsonify, Response
from models import transaction_model
from models import item as item_model
from models import user as user_model
from utils.decorators import token_required, admin_required

logger = logging.getLogger(__name__)
transactions_bp = Blueprint("transactions", __name__, url_prefix="/transactions")


def _parse_pagination():
    try:
        page = max(1, int(request.args.get("page", 1)))
    except (TypeError, ValueError):
        page = 1
    try:
        limit = min(max(1, int(request.args.get("limit", 10))), 100)
    except (TypeError, ValueError):
        limit = 10
    return page, limit


# ── POST /transactions ────────────────────────────────────────────────────────

@transactions_bp.route("", methods=["POST"])
@token_required
def log_transaction(current_user):
    data = request.get_json(silent=True) or {}

    item_id   = (data.get("item_id") or "").strip()
    txn_type  = (data.get("type") or "").strip().lower()
    quantity  = data.get("quantity")

    if not item_id:
        return jsonify({"error": "item_id is required"}), 400
    if txn_type not in (transaction_model.TYPE_ISSUED, transaction_model.TYPE_RETURNED):
        return jsonify({"error": "type must be 'issued' or 'returned'"}), 400
    try:
        quantity = int(quantity)
        if quantity <= 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "quantity must be a positive integer"}), 400

    item = item_model.find_by_id(item_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404

    user = user_model.find_by_id(current_user["user_id"])
    user_name = user["name"] if user else current_user["user_id"]

    txn_id = transaction_model.insert_transaction(
        item_id, item["name"],
        current_user["user_id"], user_name,
        txn_type, quantity,
    )
    logger.info("Transaction logged | id=%s type=%s item=%s by=%s", txn_id, txn_type, item["name"], user_name)
    return jsonify({"message": "Transaction logged", "transaction_id": txn_id}), 201


# ── GET /transactions ─────────────────────────────────────────────────────────

@transactions_bp.route("", methods=["GET"])
@token_required
def list_transactions(current_user):
    page, limit = _parse_pagination()
    txns, total = transaction_model.find_all(page, limit)
    return jsonify({
        "transactions": txns,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit,
        },
    }), 200


# ── GET /transactions/export/csv ──────────────────────────────────────────────

@transactions_bp.route("/export/csv", methods=["GET"])
@token_required
def export_csv(current_user):
    all_txns = transaction_model.find_all_raw()

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        "id", "item_name", "user_name", "type", "quantity", "timestamp", "status"
    ])
    writer.writeheader()
    for t in all_txns:
        writer.writerow({
            "id": t["id"],
            "item_name": t["item_name"],
            "user_name": t["user_name"],
            "type": t["type"].upper(),
            "quantity": t["quantity"],
            "timestamp": t["timestamp"],
            "status": t["status"].upper(),
        })

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"},
    )


# ── GET /transactions/export/pdf ──────────────────────────────────────────────

@transactions_bp.route("/export/pdf", methods=["GET"])
@token_required
def export_pdf(current_user):
    try:
        from fpdf import FPDF
    except ImportError:
        return jsonify({"error": "fpdf2 not installed. Run: pip install fpdf2"}), 500

    all_txns = transaction_model.find_all_raw()

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "Stockline — Transaction Report", ln=True, align="C")
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(0, 6, f"Total records: {len(all_txns)}", ln=True, align="C")
    pdf.ln(4)

    # Table header
    pdf.set_fill_color(30, 41, 59)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 8)
    col_widths = [45, 40, 25, 18, 40, 22]
    headers = ["Item", "User", "Type", "Qty", "Timestamp", "Status"]
    for i, h in enumerate(headers):
        pdf.cell(col_widths[i], 7, h, border=1, fill=True, align="C")
    pdf.ln()

    # Table rows
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "", 7)
    fill = False
    for t in all_txns:
        pdf.set_fill_color(240, 245, 255) if fill else pdf.set_fill_color(255, 255, 255)
        row = [t["item_name"], t["user_name"], t["type"].upper(),
               str(t["quantity"]), t["timestamp"], t["status"].upper()]
        for i, cell in enumerate(row):
            pdf.cell(col_widths[i], 6, cell[:28], border=1, fill=True, align="C")
        pdf.ln()
        fill = not fill

    pdf_bytes = pdf.output()
    return Response(
        bytes(pdf_bytes),
        mimetype="application/pdf",
        headers={"Content-Disposition": "attachment; filename=transactions.pdf"},
    )
