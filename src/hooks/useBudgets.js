import { useState, useEffect, useCallback } from 'react'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function useBudgets(month) {
  const [budgets, setBudgets] = useState([])

  useEffect(() => {
    if (!month) return
    fetch(`/api/budgets?month=${month}`)
      .then((r) => r.json())
      .then((data) => setBudgets(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [month])

  const setBudget = useCallback(async (category, amount) => {
    const id = genId()
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, category, month, amount: Number(amount) }),
    }).catch(() => null)
    if (!res?.ok) return
    const data = await res.json()
    setBudgets((prev) => {
      const existing = prev.find((b) => b.category === category)
      if (existing) return prev.map((b) => b.category === category ? { ...b, amount: Number(amount) } : b)
      return [...prev, { id: data.id, category, month, amount: Number(amount) }]
    })
  }, [month])

  const getBudget = useCallback((category) => {
    return budgets.find((b) => b.category === category)?.amount || 0
  }, [budgets])

  return { budgets, setBudget, getBudget }
}
