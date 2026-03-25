export function calculateSalary({ income, dollarRate, workingDays, extraDays, leaveDays, attendanceBonus = 0 }) {
  const monthlyPKR = income * dollarRate
  const dailyWage = workingDays > 0 ? monthlyPKR / workingDays : 0
  const overtimeRate = dailyWage * 1.5

  // Leave offsets extra days: overlapping portion cancels out
  const offsetDays = Math.min(leaveDays, extraDays)
  const remainingExtra = extraDays - offsetDays   // paid at 1.5x overtime
  const remainingLeave = leaveDays - offsetDays   // deducted at 1x

  const extraPay = remainingExtra * overtimeRate
  const leaveDeduction = remainingLeave * dailyWage
  const finalSalary = monthlyPKR + extraPay - leaveDeduction + attendanceBonus

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
