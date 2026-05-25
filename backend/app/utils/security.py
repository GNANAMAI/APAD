import secrets
import string

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def generate_otp(length: int = 6) -> str:
    return "".join(secrets.choice(string.digits) for _ in range(length))


def generate_token_string() -> str:
    return "tk_" + secrets.token_urlsafe(16)


def mask_mobile(mobile: str) -> str:
    if len(mobile) < 4:
        return "****"
    return f"+91 *****{mobile[-4:]}"
