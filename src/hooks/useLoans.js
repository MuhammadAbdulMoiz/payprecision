import { useState, useEffect, useCallback } from 'react'

export function useLoans() {
  const [loans, setLoans] = useState([])

  const fetchLoans = useCallback(async () => {
    const res = await fetch('/api/loans')
    if (res.ok) setLoans(await res.json())
  }, [])

  useEffect(() => { fetchLoans() }, [fetchLoans])

  const addLoan = useCallback(async (data) => {
    const res = await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const loan = await res.json()
      setLoans(prev => [loan, ...prev])
      return loan
    }
    return null
  }, [])

  const updateLoan = useCallback(async (id, data) => {
    const res = await fetch(`/api/loans/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const updated = await res.json()
      setLoans(prev => prev.map(l => l.id === id ? updated : l))
    }
  }, [])

  const deleteLoan = useCallback(async (id) => {
    await fetch(`/api/loans/${id}`, { method: 'DELETE' })
    setLoans(prev => prev.filter(l => l.id !== id))
  }, [])

  const uploadLoanImage = useCallback(async (id, file) => {
    const reader = new FileReader()
    return new Promise((resolve) => {
      reader.onload = async (e) => {
        const res = await fetch(`/api/images/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: e.target.result }),
        })
        if (res.ok) {
          await updateLoan(id, { hasImage: true })
          resolve(true)
        } else resolve(false)
      }
      reader.readAsDataURL(file)
    })
  }, [updateLoan])

  const payLoan = useCallback(async (id, amount, note = '') => {
    const paymentDate = new Date().toISOString().slice(0, 10)
    const res = await fetch(`/api/loans/${id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, paymentDate, note }),
    })
    if (res.ok) {
      await fetchLoans()
      return true
    }
    return false
  }, [fetchLoans])

  return { loans, addLoan, updateLoan, deleteLoan, uploadLoanImage, payLoan, refetch: fetchLoans }
}

export function useLoanPayments(loanId) {
  const [payments, setPayments] = useState([])

  const fetchPayments = useCallback(async () => {
    if (!loanId) return
    const res = await fetch(`/api/loans/${loanId}/payments`)
    if (res.ok) setPayments(await res.json())
  }, [loanId])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const addPayment = useCallback(async (loanId, amount, paymentDate, note = '') => {
    const res = await fetch(`/api/loans/${loanId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, paymentDate, note }),
    })
    if (res.ok) {
      const p = await res.json()
      setPayments(prev => [p, ...prev])
      return p
    }
    return null
  }, [])

  const deletePayment = useCallback(async (loanId, payId) => {
    await fetch(`/api/loans/${loanId}/payments/${payId}`, { method: 'DELETE' })
    setPayments(prev => prev.filter(p => p.id !== payId))
  }, [])

  return { payments, addPayment, deletePayment }
}
