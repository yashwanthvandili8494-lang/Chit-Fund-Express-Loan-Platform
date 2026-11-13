from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any

class HRMSEngine:
    @staticmethod
    def calculate_statutory_deductions(basic: Decimal, gross: Decimal) -> Dict[str, Decimal]:
        """
        Calculates Indian statutory payroll deductions:
        1. PF: 12% of basic salary (statutory standard)
        2. ESI: 0.75% of gross if gross <= 21,000; else 0
        3. Professional Tax (PT Karnataka): Rs. 200 for gross >= 15,000
        4. Estimated TDS: 5% on gross above 50,000/mo threshold
        """
        # EPF: 12% of basic
        pf = (basic * Decimal('0.12')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        # ESI: 0.75% of gross if gross <= 21000
        if gross <= Decimal('21000.00'):
            esi = (gross * Decimal('0.0075')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        else:
            esi = Decimal('0.00')

        # Professional Tax (Karnataka Standard: Rs 200 for salary >= 15000)
        pt = Decimal('200.00') if gross >= Decimal('15000.00') else Decimal('0.00')

        # TDS estimated deduction
        if gross >= Decimal('60000.00'):
            tds = ((gross - Decimal('50000.00')) * Decimal('0.10')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        else:
            tds = Decimal('0.00')

        total_deductions = pf + esi + pt + tds
        net_pay = gross - total_deductions

        return {
            "pf": pf,
            "esi": esi,
            "pt": pt,
            "tds": tds,
            "total_deductions": total_deductions,
            "net_pay": net_pay
        }

    @staticmethod
    def calculate_monthly_payroll(
        basic: Decimal,
        hra: Decimal,
        allowances: Decimal,
        total_working_days: int,
        days_present: int,
        bonuses: Decimal = Decimal('0.00'),
        advance_deduction: Decimal = Decimal('0.00')
    ) -> Dict[str, Any]:
        """
        Calculates earned salary based on attendance days and applies statutory deductions.
        """
        if total_working_days <= 0:
            total_working_days = 30
        
        attendance_ratio = Decimal(days_present) / Decimal(total_working_days)

        earned_basic = (basic * attendance_ratio).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        earned_hra = (hra * attendance_ratio).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        earned_allowances = (allowances * attendance_ratio).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        gross_earned = earned_basic + earned_hra + earned_allowances + bonuses
        
        deductions = HRMSEngine.calculate_statutory_deductions(earned_basic, gross_earned)
        
        total_deductions = deductions["total_deductions"] + advance_deduction
        net_pay = gross_earned - total_deductions

        return {
            "total_working_days": total_working_days,
            "days_present": days_present,
            "days_absent": total_working_days - days_present,
            "earned_basic": earned_basic,
            "earned_hra": earned_hra,
            "earned_allowances": earned_allowances,
            "bonuses": bonuses,
            "gross_earned": gross_earned,
            "deduction_pf": deductions["pf"],
            "deduction_esi": deductions["esi"],
            "deduction_pt": deductions["pt"],
            "deduction_tds": deductions["tds"],
            "advance_deduction": advance_deduction,
            "total_deductions": total_deductions,
            "net_pay": net_pay,
            "net_pay_in_words": HRMSEngine.amount_to_words(int(net_pay))
        }

    @staticmethod
    def amount_to_words(number: int) -> str:
        """
        Converts integer Indian Rupee amount to English words.
        """
        units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
                 "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
                 "Seventeen", "Eighteen", "Nineteen"]
        tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

        if number == 0:
            return "Zero Rupees Only"

        def _convert_chunk(n):
            out = []
            if n >= 100:
                out.append(units[n // 100] + " Hundred")
                n %= 100
            if n >= 20:
                out.append(tens[n // 10])
                if n % 10 > 0:
                    out.append(units[n % 10])
            elif n > 0:
                out.append(units[n])
            return " ".join(out)

        crores = number // 10000000
        number %= 10000000
        lakhs = number // 100000
        number %= 100000
        thousands = number // 1000
        number %= 1000
        remainder = number

        parts = []
        if crores > 0:
            parts.append(_convert_chunk(crores) + " Crore")
        if lakhs > 0:
            parts.append(_convert_chunk(lakhs) + " Lakh")
        if thousands > 0:
            parts.append(_convert_chunk(thousands) + " Thousand")
        if remainder > 0:
            parts.append(_convert_chunk(remainder))

        return " ".join(parts).strip() + " Rupees Only"
