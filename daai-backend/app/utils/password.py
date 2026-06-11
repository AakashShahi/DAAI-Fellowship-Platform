from passlib.context import CryptContext
import logging

logger = logging.getLogger(__name__)

BCRYPT_MAX_PASSWORD_BYTES = 72

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    logger.info(f"hash_password: password_length={len(password)} chars, byte_length={len(password_bytes)} bytes")
    
    if len(password_bytes) > BCRYPT_MAX_PASSWORD_BYTES:
        raise ValueError("Password cannot be longer than 72 bytes")

    try:
        return pwd_context.hash(password)
    except Exception as e:
        logger.error(f"hash_password error: {type(e).__name__}: {str(e)}", exc_info=True)
        raise


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
