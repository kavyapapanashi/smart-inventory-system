"""
routes/reports.py — Reports and analytics endpoints.

GET /reports/summary          → Dashboard summary stats (authenticated)
GET /reports/export/inventory/csv → Full inventory CSV (authenticated)
GET /reports/export/inventory/pdf → Full inventory PDF (authenticated)
GET /reports/export/requests/pdf  → Requests report PDF (authenticated)
"""
import csv
import io
import logging
from flask import Blueprint, request, jsonify, Response
from models import item as item_model
from models import request_model
from models import transaction_model
from utils.decorators import token_required

logger = logging.getLogger(__name__)
reports_bp = Blueprint("reports", __name__, url_prefix="/reports")


# ── GET /reports/summary ──────────────────────────────────────────────────────

@reports_bp.route("/summary", methods=["GET"])
@token_required
def summary(current_user):
    from models.db import get_db
    db = get_db()

    total_items   = db["items"].count_documents({})
    low_stock     = db["items"].count_documents({"quantity": {"$lte": 10, "$gt": 0}})
    out_of_stock  = db["items"].count_documents({"quantity": 0})
    total_users   = db["users"].count_documents({})
    pending_reqs  = db["requests"].count_documents({"status": "pending"})
    approved_reqs = db["requests"].count_documents({"status": "approved"})
    total_txns    = db["transactions"].count_documents({})

    return jsonify({
        "total_items": total_items,
        "low_stock": low_stock,
        "out_of_stock": out_of_stock,
        "total_users": total_users,
        "pending_requests": pending_reqs,
        "approved_requests": approved_reqs,
        "total_transactions": total_txns,
    }), 200


# ── GET /reports/export/inventory/csv ─────────────────────────────────────────

@reports_bp.route("/export/inventory/csv", methods=["GET"])
@token_required
def inventory_csv(current_user):
    from models.db import get_db
    items = list(get_db()["items"].find({}))

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Quantity", "Status", "Description"])
    for item in items:
        qty = item.get("quantity", 0)
        if qty > 10:
            status = "IN STOCK"
        elif qty > 0:
            status = "LOW STOCK"
        else:
            status = "OUT OF STOCK"
        writer.writerow([
            str(item["_id"]),
            item.get("name", ""),
            qty,
            status,
            item.get("description", ""),
        ])

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=inventory_report.csv"},
    )


# ── GET /reports/export/inventory/pdf ─────────────────────────────────────────

@reports_bp.route("/export/inventory/pdf", methods=["GET"])
@token_required
def inventory_pdf(current_user):
    try:
        from fpdf import FPDF
    except ImportError:
        return jsonify({"error": "fpdf2 not installed. Run: pip install fpdf2"}), 500

    from models.db import get_db
    items = list(get_db()["items"].find({}))

    pdf = FPDF()
    pdf.add_page()

    # Title
    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 12, "Stockline — Inventory Report", ln=True, align="C")
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(0, 6, f"Total items: {len(items)}", ln=True, align="C")
    pdf.ln(6)

    # Table header
    pdf.set_fill_color(30, 41, 59)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 9)
    col_widths = [70, 30, 40, 50]
    headers = ["Item Name", "Qty", "Status", "Description"]
    for i, h in enumerate(headers):
        pdf.cell(col_widths[i], 8, h, border=1, fill=True, align="C")
    pdf.ln()

    # Rows
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "", 8)
    fill = False
    for item in items:
        qty = item.get("quantity", 0)
        status = "IN STOCK" if qty > 10 else ("LOW STOCK" if qty > 0 else "OUT OF STOCK")
        pdf.set_fill_color(240, 248, 255) if fill else pdf.set_fill_color(255, 255, 255)
        row = [
            item.get("name", "")[:35],
            str(qty),
            status,
            item.get("description", "")[:30],
        ]
        for i, cell in enumerate(row):
            pdf.cell(col_widths[i], 7, cell, border=1, fill=True)
        pdf.ln()
        fill = not fill

    pdf_bytes = pdf.output()
    return Response(
        bytes(pdf_bytes),
        mimetype="application/pdf",
        headers={"Content-Disposition": "attachment; filename=inventory_report.pdf"},
    )


# ── GET /reports/export/requests/pdf ─────────────────────────────────────────

@reports_bp.route("/export/requests/pdf", methods=["GET"])
@token_required
def requests_pdf(current_user):
    try:
        from fpdf import FPDF
    except ImportError:
        return jsonify({"error": "fpdf2 not installed. Run: pip install fpdf2"}), 500

    from models.db import get_db
    reqs = list(get_db()["requests"].find({}))

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 12, "Stockline — Requests Report", ln=True, align="C")
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(0, 6, f"Total requests: {len(reqs)}", ln=True, align="C")
    pdf.ln(6)

    pdf.set_fill_color(30, 41, 59)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 9)
    col_widths = [70, 25, 40, 55]
    headers = ["Item Name", "Qty", "Status", "Requested By"]
    for i, h in enumerate(headers):
        pdf.cell(col_widths[i], 8, h, border=1, fill=True, align="C")
    pdf.ln()

    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "", 8)
    fill = False
    for r in reqs:
        pdf.set_fill_color(240, 248, 255) if fill else pdf.set_fill_color(255, 255, 255)
        row = [
            r.get("item_name", "")[:35],
            str(r.get("quantity", 0)),
            r.get("status", "").upper(),
            r.get("requested_by", "")[:25],
        ]
        for i, cell in enumerate(row):
            pdf.cell(col_widths[i], 7, cell, border=1, fill=True)
        pdf.ln()
        fill = not fill

    pdf_bytes = pdf.output()
    return Response(
        bytes(pdf_bytes),
        mimetype="application/pdf",
        headers={"Content-Disposition": "attachment; filename=requests_report.pdf"},
    )
