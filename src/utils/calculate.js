/**
 * Pakistan income tax estimate (FY 2024-25 salaried brackets).
 * Takes annual salary in PKR, returns annual tax.
 */
export function calculatePakistanTax(annualSalary) {
  if (annualSalary <= 600_000) return 0
  if (annualSalary <= 1_200_000) return (annualSalary - 600_000) * 0.05
  if (annualSalary <= 2_400_000) return 30_000 + (annualSalary - 1_200_000) * 0.15
  if (annualSalary <= 3_600_000) return 210_000 + (annualSalary - 2_400_000) * 0.25
  if (annualSalary <= 6_000_000) return 510_000 + (annualSalary - 3_600_000) * 0.30
  return 1_230_000 + (annualSalary - 6_000_000) * 0.35
}

export function calculateSalary({ income, dollarRate, workingDays, extraDays, leaveDays, attendanceBonus = 0, empType = 'intern' }) {
  const monthlyPKR = income * dollarRate
  const dailyWage = workingDays > 0 ? monthlyPKR / workingDays : 0
  const overtimeRate = dailyWage * 1.5

  // Leave offsets extra days: overlapping portion cancels out
  const offsetDays = Math.min(leaveDays, extraDays)
  const remainingExtra = extraDays - offsetDays   // paid at 1.5x overtime
  const remainingLeave = leaveDays - offsetDays   // deducted at 1x

  const extraPay = remainingExtra * overtimeRate
  const leaveDeduction = remainingLeave * dailyWage

  // Provident fund: 5% of base salary for full-time employees only
  const providentFund = empType === 'fulltime' ? monthlyPKR * 0.05 : 0

  const finalSalary = monthlyPKR + extraPay - leaveDeduction + attendanceBonus - providentFund

  return {
    monthlyPKR,
    dailyWage,
    overtimeRate,
    extraPay,
    leaveDeduction,
    offsetDays,
    remainingExtra,
    remainingLeave,
    attendanceBonus,
    providentFund,
    finalSalary,
  }
}

export function getWeekdaysInMonth(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let weekdays = 0
  for (let d = 1; d <= daysInMonth; d++) {
    const day = new Date(year, month, d).getDay()
    if (day !== 0 && day !== 6) weekdays++
  }
  return weekdays
}
