import { useState } from 'react'
import { useDeposits } from '../hooks/useDeposits'

function fmtPKR(v) {
  if (typeof v !== 'number' || isNaN(v)) return '0'
  return v.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtMonth(m) {
  if (!m) return ''
  const [y, mo] = m.split('-')
  return new Date(Number(y), Number(mo) - 1).toLocaleString('en-US', { month: 'short', year: '2-digit' })
}

const RATE_OPTIONS = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30]

export default function GoalCard({ goal, onDelete, onUpdate, finalSalary, linkedLoans = [] }) {
  const imageSrc = goal.hasImage ? `/api/images/${goal.id}` : null
  const [showDeposits, setShowDeposits] = useState(false)
  const [depAmount, setDepAmount] = useState('')
  const [depMonth, setDepMonth] = useState(new Date().toISOString().slice(0, 7))
  const [depNote, setDepNote] = useState('')
  const [localSaved, setLocalSaved] = useState(goal.savedAmount)
  const [localRate, setLocalRate] = useState(goal.savingsRate ?? 0.10)

  const { deposits, addDeposit, deleteDeposit } = useDeposits(showDeposits ? goal.id : null)

  const saved = localSaved
  const progress = goal.targetAmount > 0 ? Math.min((saved / goal.targetAmount) * 100, 100) : 0
  const remaining = Math.max(goal.targetAmount - saved, 0)
  const monthlyContribution = (finalSalary || 0) * localRate

  let timeLabel = 'Goal reached!'
  if (remaining > 0) {
    if (monthlyContribution <= 0) {
      timeLabel = 'Set salary to estimate'
    } else {
      const months = Math.ceil(remaining / monthlyContribution)
      timeLabel = months > 12
        ? `~${Math.ceil(months / 12)} yr${Math.ceil(months / 12) !== 1 ? 's' : ''}`
        : `~${months} mo${months !== 1 ? 's' : ''}`
    }
  }

  const handleRateChange = (rate) => {
    setLocalRate(rate)
    onUpdate(goal.id, { savingsRate: rate })
  }

  const handleAddDeposit = async (e) => {
    e.preventDefault()
    if (!depAmount) return
    const newSaved = await addDeposit(depAmount, depMonth, depNote)
    if (newSaved !== null) {
      setLocalSaved(newSaved)
      onUpdate(goal.id, { savedAmount: newSaved })
    }
    setDepAmount('')
    setDepNote('')
  }

  const handleDeleteDeposit = async (id) => {
    const newSaved = await deleteDeposit(id)
    if (newSaved !== null) {
      setLocalSaved(newSaved)
      onUpdate(goal.id, { savedAmount: newSaved })
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl shadow-lg h-full" style={{ minHeight: '260px' }}>
      {/* Background */}
      {imageSrc ? (
        <img src={imageSrc} alt={goal.name}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: 'brightness(0.55)' }} />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Delete */}
      <button onClick={() => onDelete(goal.id)} aria-label="Delete goal"
        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Content */}
      <div className="relative flex h-full flex-col justify-end p-4" style={{ minHeight: '260px' }}>
        {linkedLoans.length > 0 && (
          <div className="mb-1">
            <span className="rounded-full bg-red-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
              {linkedLoans.length} loan{linkedLoans.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        <h3 className="text-base font-bold text-white drop-shadow">{goal.name}</h3>
        {goal.description && (
          <p className="mt-0.5 text-xs text-white/60 line-clamp-1">{goal.description}</p>
        )}

        {/* Progress bar */}
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-emerald-400 transition-all duration-700"
            style={{ width: `${progress}%` }} />
        </div>

        {/* Stats row */}
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Saved</p>
            <p className="text-sm font-bold text-white">PKR {fmtPKR(saved)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Remaining</p>
            <p className="text-sm font-bold text-white">PKR {fmtPKR(remaining)}</p>
          </div>
        </div>

        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-emerald-400">{Math.round(progress)}% complete</span>
          <span className="text-[11px] text-blue-300">{timeLabel}</span>
        </div>

        {/* Individual savings rate picker */}
        <div className="mt-2">
          <p className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-white/40">
            My savings rate for this goal
          </p>
          <div className="flex gap-1">
            {RATE_OPTIONS.map((r) => (
              <button key={r} onClick={() => handleRateChange(r)}
                className={`flex-1 rounded py-1 text-[10px] font-bold transition-colors ${
                  localRate === r
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                }`}>
                {Math.round(r * 100)}%
              </button>
            ))}
          </div>
          {finalSalary > 0 && (
            <p className="mt-1 text-[10px] text-white/40">
              = PKR {fmtPKR(monthlyContribution)} / month
            </p>
          )}
        </div>

        {/* Deposit log toggle */}
        <button onClick={() => setShowDeposits((v) => !v)}
          className="mt-2 w-full rounded-lg bg-white/10 py-1 text-[11px] font-medium text-white/70 transition-colors hover:bg-white/20 hover:text-white">
          {showDeposits ? 'Hide Deposits' : 'Deposit Log'}
        </button>
      </div>

      {/* Deposit panel */}
      {showDeposits && (
        <div className="absolute inset-0 z-20 overflow-y-auto rounded-2xl bg-slate-900/97 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold text-white">Deposit Log · {goal.name}</p>
            <button onClick={() => setShowDeposits(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
          <form onSubmit={handleAddDeposit} className="mb-3 flex gap-1.5">
            <input type="number" min="1" placeholder="Amount" value={depAmount}
              onChange={(e) => setDepAmount(e.target.value)} required
              className="w-24 rounded border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white outline-none focus:border-blue-400/50" />
            <input type="month" value={depMonth} onChange={(e) => setDepMonth(e.target.value)}
              className="flex-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white outline-none focus:border-blue-400/50" />
            <input type="text" placeholder="Note" value={depNote}
              onChange={(e) => setDepNote(e.target.value)}
              className="flex-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white outline-none focus:border-blue-400/50" />
            <button type="submit"
              className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500">
              +Add
            </button>
          </form>
          {deposits.length === 0 ? (
            <p className="py-3 text-center text-[11px] text-slate-500">No deposits yet.</p>
          ) : (
            <div className="max-h-36 space-y-1.5 overflow-y-auto pr-1">
              {deposits.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded bg-white/5 px-2.5 py-1.5">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-400">+PKR {fmtPKR(d.amount)}</span>
                    <span className="ml-2 text-[10px] text-slate-400">{fmtMonth(d.month)}</span>
                    {d.note && <span className="ml-2 text-[10px] text-slate-500">{d.note}</span>}
                  </div>
                  <button onClick={() => handleDeleteDeposit(d.id)}
                    className="text-slate-600 hover:text-red-400 text-[10px]">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
