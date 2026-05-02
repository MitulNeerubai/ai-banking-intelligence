"""
Chatbot routes — /v1/chatbot
AI-powered finance assistant using Google Gemini (google-genai SDK).
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from google import genai
from google.genai import types

from config import Config
from utils.db import get_db
from utils.errors import ValidationError
from utils.logger import get_logger

chatbot_bp = Blueprint("chatbot", __name__, url_prefix="/v1/chatbot")
log = get_logger("routes.chatbot")

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=Config.GEMINI_API_KEY)
    return _client


def _fetch_recent_transactions(user_id: int, limit: int = 60) -> list:
    with get_db() as (conn, cur):
        cur.execute(
            """
            SELECT date, amount, category, description, institution_name, account_name
            FROM transactions
            WHERE user_id = %s
            ORDER BY date DESC
            LIMIT %s
            """,
            (user_id, limit),
        )
        cols = [d[0] for d in cur.description]
        return [dict(zip(cols, row)) for row in cur.fetchall()]


_SYSTEM_PROMPT = (
    "You are an AI-powered personal finance assistant embedded in a banking app. "
    "You have access to the user's recent transactions provided in each message. "
    "Help the user understand their spending, identify patterns, and get actionable insights. "
    "Be concise and reference specific amounts and categories from the data. "
    "Format currency as USD (e.g., $45.00). "
    "If the user asks about something not reflected in the data, say so honestly. "
    "Never fabricate transactions or numbers."
)


@chatbot_bp.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    try:
        user_id = int(get_jwt_identity())
    except (ValueError, TypeError):
        raise ValidationError("Invalid user identity in token")

    body = request.get_json(silent=True) or {}
    message = (body.get("message") or "").strip()
    if not message:
        raise ValidationError("message is required")

    transactions = _fetch_recent_transactions(user_id)
    if transactions:
        lines = "\n".join(
            f"- {t['date']} | {t['category']} | ${float(t['amount']):.2f}"
            f" | {t.get('description') or 'N/A'}"
            f" | {t.get('institution_name') or ''} {t.get('account_name') or ''}".rstrip()
            for t in transactions
        )
        context = f"User's {len(transactions)} most recent transactions:\n{lines}"
    else:
        context = "This user has no transactions on record yet."

    prompt = f"{context}\n\nUser: {message}"

    try:
        response = _get_client().models.generate_content(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT,
            ),
            contents=prompt,
        )
        answer = response.text
    except Exception:
        log.exception("Gemini API error", extra={"context": {"user_id": user_id}})
        return jsonify({"error": "AI service unavailable. Please try again."}), 503

    log.info("Chatbot response sent", extra={"context": {"user_id": user_id}})
    return jsonify({"answer": answer})
