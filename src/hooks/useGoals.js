import { useState, useEffect, useCallback } from 'react'

export function useGoals() {
  const [goals, setGoals] = useState([])

  useEffect(() => {
    fetch('/api/goals')
      .then((r) => r.json())
      .then(setGoals)
      .catch(() => {})
  }, [])

  // goalData must include a pre-generated `id` (set by GoalForm after uploading image)
  const addGoal = useCallback(async (goalData) => {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goalData),
    }).catch(() => null)
    const goal = res ? await res.json() : goalData
    setGoals((prev) => [goal, ...prev])
  }, [])

  const updateGoal = useCallback(async (id, updates) => {
    await fetch(`/api/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {})
    setGoals((prev) =>
      prev.map((g) => g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g)
    )
  }, [])

  const deleteGoal = useCallback(async (id) => {
    await fetch(`/api/goals/${id}`, { method: 'DELETE' }).catch(() => {})
    // Also delete image
    await fetch(`/api/images/${id}`, { method: 'DELETE' }).catch(() => {})
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }, [])

  return { goals, addGoal, updateGoal, deleteGoal }
}
