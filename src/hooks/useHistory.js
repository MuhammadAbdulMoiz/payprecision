import { useLocalStorage } from './useLocalStorage'
import { useCallback } from 'react'

export function useHistory() {
  const [entries, setEntries] = useLocalStorage('pp-history', [])

  const addEntry = useCallback((params, results) => {
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: new Date().toISOString(),
      params: { ...params },
      results: { ...results },
    }
    setEntries((prev) => [entry, ...prev].slice(0, 50))
  }, [setEntries])

  const clearHistory = useCallback(() => {
    setEntries([])
  }, [setEntries])

  const deleteEntry = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [setEntries])

  return { entries, addEntry, clearHistory, deleteEntry }
}
