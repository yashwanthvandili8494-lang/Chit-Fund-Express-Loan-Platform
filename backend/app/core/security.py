from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def mask_aadhaar(aadhaar: str) -> str:
    """Masks Aadhaar number keeping only last 4 digits visible as per UIDAI rules."""
    cleaned = ''.join(c for c in aadhaar if c.isdigit())
    if len(cleaned) == 12:
        return f"XXXX-XXXX-{cleaned[-4:]}"
    elif len(cleaned) >= 4:
        return f"XXXX-XXXX-{cleaned[-4:]}"
    return "XXXX-XXXX-XXXX"

def mask_pan(pan: str) -> str:
    """Masks PAN preserving first 2 and last 2 characters."""
    pan = pan.strip().upper()
    if len(pan) == 10:
        return f"{pan[:2]}XXXXX{pan[-2:]}"
    return "XXXXXXXXXX"

def mask_account_number(acc: str) -> str:
    acc = acc.strip()
    if len(acc) > 4:
        return f"XXXX-XXXX-{acc[-4:]}"
    return acc

