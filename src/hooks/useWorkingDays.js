import { useMemo } from 'react'
import { getWeekdaysInMonth } from '../utils/calculate'

export function useWorkingDays(selectedMonth, publicHolidays = 0) {
  return useMemo(() => {
    if (!selectedMonth) return 0
    const [year, month] = selectedMonth.split('-').map(Number)
    const weekdays = getWeekdaysInMonth(year, month - 1)
    return Math.max(0, weekdays - publicHolidays)
  }, [selectedMonth, publicHolidays])
}
