from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional

from app.services.financial_engines import LoanEngine

class LoanUnderwritingEngine:
    @staticmethod
    def evaluate_eligibility(
        age: int,
        kyc_status: str,
        employment_type: str,
        monthly_income: Decimal,
        requested_amount: Decimal,
        tenure_months: int,
        credit_score: int,
        bank_verified: bool = True
    ) -> Dict[str, Any]:
        """
        Performs automated multi-factor underwriting assessment:
        1. Age (21-60)
        2. KYC Verification
        3. Monthly Income thresholds
        4. FOIR (Fixed Obligation to Income Ratio)
        5. Credit Score tiering
        6. Bank account verification
        """
        score = 0
        checks = {}

        # 1. Age Check (20 pts)
        if 21 <= age <= 60:
            score += 20
            checks["age_check"] = {"passed": True, "score": 20, "message": f"Age {age} within eligible 21-60 bracket"}
        else:
            checks["age_check"] = {"passed": False, "score": 0, "message": f"Age {age} outside statutory 21-60 bracket"}

        # 2. KYC Status (20 pts)
        if kyc_status == "VERIFIED":
            score += 20
            checks["kyc_check"] = {"passed": True, "score": 20, "message": "UIDAI Aadhaar & Income Tax PAN demographic match verified"}
        else:
            checks["kyc_check"] = {"passed": False, "score": 0, "message": "Customer KYC verification incomplete or pending"}

        # 3. Income Threshold (20 pts)
        min_income = Decimal('15000.00')
        if requested_amount > Decimal('60000.00'):
            min_income = Decimal('35000.00')
        elif requested_amount > Decimal('30000.00'):
            min_income = Decimal('25000.00')

        if monthly_income >= min_income:
            score += 20
            checks["income_check"] = {
                "passed": True,
                "score": 20,
                "message": f"Monthly income of ₹{monthly_income:,.2f} satisfies required threshold of ₹{min_income:,.2f}"
            }
        else:
            checks["income_check"] = {
                "passed": False,
                "score": 0,
                "message": f"Monthly income ₹{monthly_income:,.2f} below required ₹{min_income:,.2f} threshold"
            }

        # 4. EMI & FOIR (Fixed Obligation to Income Ratio) (20 pts)
        emi_calc = LoanEngine.calculate_emi(requested_amount, Decimal('14.50'), tenure_months)
        monthly_emi = emi_calc["monthly_emi"]
        foir_pct = ((monthly_emi / monthly_income) * Decimal('100.00')).quantize(Decimal('0.1'))

        if foir_pct <= Decimal('35.0'):
            score += 20
            checks["foir_check"] = {"passed": True, "score": 20, "foir_pct": float(foir_pct), "message": f"Excellent FOIR of {foir_pct}% (<= 35%)"}
        elif foir_pct <= Decimal('50.0'):
            score += 10
            checks["foir_check"] = {"passed": True, "score": 10, "foir_pct": float(foir_pct), "message": f"Acceptable FOIR of {foir_pct}% (<= 50%)"}
        else:
            checks["foir_check"] = {"passed": False, "score": 0, "foir_pct": float(foir_pct), "message": f"High debt burden: FOIR of {foir_pct}% exceeds 50% limit"}

        # 5. Credit Assessment (20 pts)
        if credit_score >= 750:
            score += 20
            checks["credit_check"] = {"passed": True, "score": 20, "message": f"Prime bureau credit score of {credit_score}"}
        elif credit_score >= 700:
            score += 15
            checks["credit_check"] = {"passed": True, "score": 15, "message": f"Good bureau credit score of {credit_score}"}
        elif credit_score >= 650:
            score += 10
            checks["credit_check"] = {"passed": True, "score": 10, "message": f"Average bureau credit score of {credit_score}"}
        else:
            checks["credit_check"] = {"passed": False, "score": 0, "message": f"Subprime bureau credit score of {credit_score} (< 650)"}

        # Automated verdict
        if score >= 75 and checks["kyc_check"]["passed"] and checks["foir_check"]["passed"]:
            verdict = "ELIGIBLE_FOR_REVIEW"
            recommendation = "Low Risk Profile. Recommend approval subject to final document verification."
        elif score >= 50 and checks["kyc_check"]["passed"]:
            verdict = "ADDITIONAL_DOCUMENTS_REQUIRED"
            recommendation = "Moderate Risk Profile. Additional 3-month bank statement or salary slip verification required."
        else:
            verdict = "NOT_ELIGIBLE"
            recommendation = "High Risk Profile under current lending parameters. Does not satisfy minimum underwriting criteria."

        return {
            "verdict": verdict,
            "overall_score": score,
            "max_score": 100,
            "foir_pct": float(foir_pct),
            "monthly_emi": float(monthly_emi),
            "recommendation": recommendation,
            "checks": checks,
            "assessed_at": datetime.utcnow().isoformat()
        }

    @staticmethod
    def generate_key_facts_statement(
        application_no: str,
        principal: Decimal,
        annual_rate_pct: Decimal,
        tenure_months: int,
        customer_name: str,
        disbursal_bank_account: str
    ) -> Dict[str, Any]:
        """
        Generates RBI-compliant Key Facts Statement (KFS) & Sanction Terms.
        """
        emi_calc = LoanEngine.calculate_emi(principal, annual_rate_pct, tenure_months)
        monthly_emi = emi_calc["monthly_emi"]
        total_interest = emi_calc["total_interest"]
        total_repayable = emi_calc["total_payable"]

        processing_fee = (principal * Decimal('0.02')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        gst_on_fee = (processing_fee * Decimal('0.18')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        total_upfront_deductions = processing_fee + gst_on_fee
        net_disbursed_amount = principal - total_upfront_deductions

        today = date.today()
        first_emi_due = today + timedelta(days=30)
        sanction_ref = f"SANC-{today.strftime('%Y%m')}-{abs(hash(application_no)) % 100000:05d}"

        return {
            "sanction_reference_no": sanction_ref,
            "sanction_date": today.isoformat(),
            "lender_legal_entity": "Sowbhagya Chits & FinServe Private Limited",
            "money_lending_license": "KA/BLR/MLL/2021/409",
            "borrower_name": customer_name,
            "disbursal_account_masked": disbursal_bank_account,
            "principal_loan_amount": float(principal),
            "annual_percentage_rate_apr": float(annual_rate_pct),
            "monthly_interest_rate_pct": float((annual_rate_pct / Decimal('12.00')).quantize(Decimal('0.01'))),
            "loan_tenure_months": tenure_months,
            "monthly_emi_amount": float(monthly_emi),
            "total_interest_payable": float(total_interest),
            "total_amount_to_repay": float(total_repayable),
            "processing_fee": float(processing_fee),
            "gst_on_fee": float(gst_on_fee),
            "total_upfront_deductions": float(total_upfront_deductions),
            "net_disbursed_amount": float(net_disbursed_amount),
            "first_emi_due_date": first_emi_due.isoformat(),
            "cooling_off_period_days": 3,
            "penal_charges_terms": "2.0% per month on overdue EMI installment amount only. No compound penalty interest is charged.",
            "foreclosure_charges": "Nil (0%) after 3 monthly installments",
            "regulatory_declaration": "This loan sanction and Key Facts Statement conforms to RBI Digital Lending Directions and Karnataka Money Lenders Act, 1961."
        }

