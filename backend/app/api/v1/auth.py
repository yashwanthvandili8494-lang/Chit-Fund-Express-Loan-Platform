from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.models.models import User, UserRole, CustomerProfile, StaffProfile, KYCRecord, KYCStatus, AuditLog
from app.schemas.schemas import UserLogin, UserRegister, Token, UserOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.email == user_in.email) | (User.mobile_number == user_in.mobile_number)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email or mobile number already exists."
        )
    
    new_user = User(
        email=user_in.email.lower().strip(),
        mobile_number=user_in.mobile_number.strip(),
        full_name=user_in.full_name.strip(),
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        is_active=True,
        is_verified=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize associated profile based on role
    if new_user.role == UserRole.CUSTOMER:
        profile = CustomerProfile(user_id=new_user.id)
        kyc = KYCRecord(user_id=new_user.id, status=KYCStatus.NOT_SUBMITTED)
        db.add(profile)
        db.add(kyc)
    elif new_user.role == UserRole.STAFF:
        staff_prof = StaffProfile(
            user_id=new_user.id,
            employee_code=f"EMP{new_user.id:04d}",
            department="Operations"
        )
        db.add(staff_prof)
    
    db.commit()

    token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role.value})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    identity = login_data.email_or_phone.strip().lower()
    user = db.query(User).filter(
        (User.email == identity) | (User.mobile_number == identity)
    ).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/mobile number or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended or deactivated. Please contact support."
        )

    # Audit log
    audit = AuditLog(
        user_id=user.id,
        user_role=user.role.value,
        action="LOGIN_SUCCESS",
        module="AUTH",
        details=f"User {user.email} authenticated successfully"
    )
    db.add(audit)
    db.commit()

    token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/demo-accounts")
def get_demo_accounts(db: Session = Depends(get_db)):
    """Returns demo accounts and valid JWTs for immediate evaluation across Owner, Staff, and Customer roles."""
    roles = [UserRole.ADMIN, UserRole.STAFF, UserRole.CUSTOMER]
    accounts = []
    
    for r in roles:
        user = db.query(User).filter(User.role == r, User.is_active == True).first()
        if user:
            token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
            accounts.append({
                "role": user.role.value,
                "email": user.email,
                "password": "Password@123",
                "full_name": user.full_name,
                "token": token,
                "user_id": user.id
            })
            
    return {"demo_accounts": accounts}

