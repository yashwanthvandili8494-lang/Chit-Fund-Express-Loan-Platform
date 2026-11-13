from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, date
from decimal import Decimal

from app.core.database import get_db
from app.api.deps import require_admin
from app.models.models import User, Expense, Branch, AuditLog
from app.schemas.schemas import ExpenseOut, ExpenseCreate

router = APIRouter(prefix="/expenses", tags=["Office Expenses & Accounting"])

@router.get("", response_model=List[ExpenseOut])
def get_expenses(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(Expense).order_by(Expense.expense_date.desc()).all()

@router.post("", response_model=ExpenseOut)
def record_expense(
    req: ExpenseCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    branch = db.query(Branch).filter(Branch.id == req.branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    count = db.query(Expense).count()
    voucher_no = f"EXP-{date.today().strftime('%Y%m')}-{count + 1:04d}"

    expense = Expense(
        voucher_no=voucher_no,
        branch_id=req.branch_id,
        category=req.category,
        amount=req.amount,
        expense_date=req.expense_date,
        description=req.description,
        vendor_name=req.vendor_name,
        receipt_reference=req.receipt_reference,
        payment_mode=req.payment_mode,
        approved_by=admin.full_name
    )
    db.add(expense)

    audit = AuditLog(
        user_id=admin.id,
        user_role="ADMIN",
        action="RECORD_EXPENSE",
        module="ACCOUNTING",
        entity_id=voucher_no,
        details=f"Recorded expense {voucher_no} of Rs {req.amount} under {req.category}"
    )
    db.add(audit)
    db.commit()
    db.refresh(expense)
    return expense

@router.get("/summary")
def get_expenses_summary(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
) -> Dict[str, Any]:
    expenses = db.query(Expense).all()
    total_amount = sum(e.amount for e in expenses) if expenses else Decimal('0.00')

    by_category: Dict[str, Decimal] = {}
    for e in expenses:
        by_category[e.category] = by_category.get(e.category, Decimal('0.00')) + e.amount

    return {
        "total_expenses": float(total_amount),
        "count": len(expenses),
        "by_category": {k: float(v) for k, v in by_category.items()}
    }
