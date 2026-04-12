import { useState, useEffect, useCallback } from 'react'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function useDeposits(goalId) {
  const [deposits, setDeposits] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!goalId) return
    setLoading(true)
    fetch(`/api/deposits?goalId=${goalId}`)
      .then((r) => r.json())
      .then((data) => { setDeposits(Array.isArray(data) ? data : []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [goalId])

  const addDeposit = useCallback(async (amount, month, note = '') => {
    const entry = { id: genId(), goalId, amount: Number(amount), month, note }
    const res = await fetch('/api/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(() => null)
    if (!res?.ok) return null
    const data = await res.json()
    setDeposits((prev) => [entry, ...prev])
    return data.newSavedAmount
  }, [goalId])

  const deleteDeposit = useCallback(async (id) => {
    const res = await fetch(`/api/deposits/${id}`, { method: 'DELETE' }).catch(() => null)
    if (!res?.ok) return null
    const data = await res.json()
    setDeposits((prev) => prev.filter((d) => d.id !== id))
    return data.newSavedAmount
  }, [])

  return { deposits, loading, addDeposit, deleteDeposit }
}
