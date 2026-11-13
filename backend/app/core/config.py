import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "ChitXpert & FinServe Capital - Chit Fund & Loan Management Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "chit_fund_fintech_super_secret_jwt_key_2026_secure_key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Database URL - supports SQLite fallback or PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./chit_fund_loan.db")
    
    # Indian Regulatory defaults (Chit Funds Act 1982 & Karnataka Rules)
    COMPANY_NAME: str = "Sowbhagya Chits & FinServe Private Limited"
    COMPANY_CIN: str = "U65992KA2018PTC112345"
    REGISTRAR_CHIT_OFFICE: str = "Registrar of Chits, Government of Karnataka, Bengaluru"
    CHIT_REGISTRATION_NO: str = "KA/BLR/CHIT/2019/882"
    MONEY_LENDING_LICENSE: str = "KA/BLR/MLL/2021/409"
    DEFAULT_FOREMAN_COMMISSION_PCT: float = 5.0 # Max 5% as per Chit Funds Act
    MAX_PERMITTED_DISCOUNT_PCT: float = 40.0 # Under Karnataka Chit Rules
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000"
    ]

    class Config:
        case_sensitive = True

settings = Settings()

