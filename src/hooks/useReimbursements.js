import { useState, useEffect, useCallback } from 'react'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function useReimbursements() {
  const [aiItems, setAiItems] = useState([])
  const [laptopItems, setLaptopItems] = useState([])

  useEffect(() => {
    fetch('/api/reimbursements/ai').then(r => r.json()).then(setAiItems).catch(() => {})
    fetch('/api/reimbursements/laptop').then(r => r.json()).then(setLaptopItems).catch(() => {})
  }, [])

  // ── AI ────────────────────────────────────────────────────────────────

  const addAI = useCallback(async (data) => {
    const id = genId()
    const body = { id, name: data.name || 'New Provider', amount: data.amount ?? 10, applied: false, hasLogo: false }
    const res = await fetch('/api/reimbursements/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const created = await res.json()
    setAiItems(prev => [created, ...prev])
    return created
  }, [])

  const updateAI = useCallback(async (id, patch) => {
    const res = await fetch(`/api/reimbursements/ai/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    const updated = await res.json()
    setAiItems(prev => prev.map(item => item.id === id ? updated : item))
    return updated
  }, [])

  const deleteAI = useCallback(async (id) => {
    await fetch(`/api/reimbursements/ai/${id}`, { method: 'DELETE' })
    // Also remove logo image
    await fetch(`/api/images/${id}`, { method: 'DELETE' }).catch(() => {})
    setAiItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const uploadAILogo = useCallback(async (id, imageData) => {
    await fetch(`/api/images/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageData }),
    })
    await updateAI(id, { hasLogo: true })
  }, [updateAI])

  // ── Laptop ────────────────────────────────────────────────────────────

  const addLaptop = useCallback(async (data) => {
    const id = genId()
    const totalAmount = data.totalAmount || 0
    const body = {
      id,
      name: data.name || 'New Laptop',
      ram: data.ram || '',
      ssd: data.ssd || '',
      gpu: data.gpu || '',
      processor: data.processor || '',
      totalAmount,
      monthlyAmount: totalAmount / 36,
      startDate: data.startDate || '',
      hasImage: false,
    }
    const res = await fetch('/api/reimbursements/laptop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const created = await res.json()
    setLaptopItems(prev => [created, ...prev])
    return created
  }, [])

  const updateLaptop = useCallback(async (id, patch) => {
    // Recalculate monthly if totalAmount changed
    if (patch.totalAmount !== undefined && patch.monthlyAmount === undefined) {
      patch = { ...patch, monthlyAmount: patch.totalAmount / 36 }
    }
    const res = await fetch(`/api/reimbursements/laptop/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    const updated = await res.json()
    setLaptopItems(prev => prev.map(item => item.id === id ? updated : item))
    return updated
  }, [])

  const deleteLaptop = useCallback(async (id) => {
    await fetch(`/api/reimbursements/laptop/${id}`, { method: 'DELETE' })
    await fetch(`/api/images/${id}`, { method: 'DELETE' }).catch(() => {})
    setLaptopItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const uploadLaptopImage = useCallback(async (id, imageData) => {
    await fetch(`/api/images/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageData }),
    })
    await updateLaptop(id, { hasImage: true })
  }, [updateLaptop])

  return {
    aiItems,
    laptopItems,
    addAI,
    updateAI,
    deleteAI,
    uploadAILogo,
    addLaptop,
    updateLaptop,
    deleteLaptop,
    uploadLaptopImage,
  }
}
