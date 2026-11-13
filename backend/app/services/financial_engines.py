from decimal import Decimal, ROUND_HALF_UP
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from typing import Dict, List, Tuple, Any

class ChitEngine:
    @staticmethod
    def calculate_auction_distribution(
        chit_value: Decimal,
        total_subscribers: int,
        foreman_commission_pct: Decimal,
        winning_bid_discount: Decimal
    ) -> Dict[str, Decimal]:
        """
        Compliant with the Chit Funds Act, 1982:
        - Foreman Commission = chit_value * foreman_commission_pct (statutory max 5%)
        - Total Dividend = winning_bid_discount - foreman_commission
        - Dividend per member = total_dividend / total_subscribers
        - Net Prize Amount disbursed to winner = chit_value - winning_bid_discount
        - Net installment payable next month = (chit_value / total_subscribers) - dividend_per_member
        """
        foreman_commission = (chit_value * (foreman_commission_pct / Decimal('100'))).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        # Verify bid discount covers foreman commission
        if winning_bid_discount < foreman_commission:
            winning_bid_discount = foreman_commission
            
        total_dividend = winning_bid_discount - foreman_commission
        dividend_per_member = (total_dividend / Decimal(total_subscribers)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        net_prize_amount = (chit_value - winning_bid_discount).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        gross_monthly_installment = (chit_value / Decimal(total_subscribers)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        net_monthly_payable = (gross_monthly_installment - dividend_per_member).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        return {
            "foreman_commission": foreman_commission,
            "total_dividend": total_dividend,
            "dividend_per_member": dividend_per_member,
            "net_prize_amount": net_prize_amount,
            "gross_monthly_installment": gross_monthly_installment,
            "net_monthly_payable": net_monthly_payable
        }

class LoanEngine:
    @staticmethod
    def calculate_emi(
        principal: Decimal,
        annual_interest_rate_pct: Decimal,
        tenure_months: int
    ) -> Dict[str, Any]:
        """
        Standard reducing balance EMI formula:
        E = [P x r x (1+r)^n] / [((1+r)^n) - 1]
        where r = monthly interest rate in decimals
        """
        p = float(principal)
        r = float(annual_interest_rate_pct) / (12 * 100)
        n = int(tenure_months)
        
        if r > 0:
            emi_float = (p * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1)
        else:
            emi_float = p / n
            
        monthly_emi = Decimal(str(round(emi_float, 2)))
        total_payable = monthly_emi * Decimal(n)
        total_interest = total_payable - principal
        
        return {
            "monthly_emi": monthly_emi,
            "total_interest": total_interest,
            "total_payable": total_payable
        }

    @staticmethod
    def generate_repayment_schedule(
        principal: Decimal,
        annual_interest_rate_pct: Decimal,
        tenure_months: int,
        start_date: date
    ) -> List[Dict[str, Any]]:
        """
        Generates full month-by-month repayment amortization schedule.
        """
        schedule = []
        p_balance = float(principal)
        r = float(annual_interest_rate_pct) / (12 * 100)
        n = int(tenure_months)
        
        if r > 0:
            emi_float = (p_balance * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1)
        else:
            emi_float = p_balance / n
            
        fixed_emi = round(emi_float, 2)
        current_date = start_date

        for i in range(1, n + 1):
            interest_comp = round(p_balance * r, 2)
            principal_comp = round(fixed_emi - interest_comp, 2)
            
            # Handle final rounding adjustment on last installment
            if i == n or principal_comp > p_balance:
                principal_comp = round(p_balance, 2)
                fixed_emi = round(principal_comp + interest_comp, 2)
                p_balance = 0.0
            else:
                p_balance = round(p_balance - principal_comp, 2)
                
            due_date = current_date + relativedelta(months=i)
            
            schedule.append({
                "emi_number": i,
                "due_date": due_date,
                "emi_amount": Decimal(str(fixed_emi)),
                "principal_component": Decimal(str(principal_comp)),
                "interest_component": Decimal(str(interest_comp)),
                "remaining_principal": Decimal(str(max(0.0, p_balance)))
            })
            
        return schedule
