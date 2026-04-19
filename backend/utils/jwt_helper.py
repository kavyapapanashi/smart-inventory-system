"""
utils/jwt_helper.py — JWT encode / decode helpers.
"""
import jwt
import datetime
import logging
from config import Config

logger = logging.getLogger(__name__)


def generate_token(user_id: str, role: str) -> str:
    """Create a signed JWT that expires in JWT_EXPIRY_HOURS hours."""
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.datetime.utcnow()
        + datetime.timedelta(hours=Config.JWT_EXPIRY_HOURS),
        "iat": datetime.datetime.utcnow(),
    }
    token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")
    logger.debug("Token generated for user_id=%s role=%s", user_id, role)
    return token


def decode_token(token: str) -> dict | None:
    """
    Decode and validate a JWT.
    Returns the payload dict, or None on any error.
    """
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        return None
    except jwt.InvalidTokenError as exc:
        logger.warning("Invalid token: %s", exc)
        return None
