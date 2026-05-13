import { useState, useRef } from 'react'

// ── helpers ───────────────────────────────────────────────────────────────────

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function calcLaptopStats(item) {
  if (!item.startDate) return { monthsElapsed: 0, totalReimbursed: 0, remaining: item.totalAmount, monthsLeft: 36 }
  const start = new Date(item.startDate + '-01')
  const now = new Date()
  const months = Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth())
  const elapsed = Math.min(months, 36)
  const reimbursed = elapsed * item.monthlyAmount
  return {
    monthsElapsed: elapsed,
    totalReimbursed: reimbursed,
    remaining: item.totalAmount - reimbursed,
    monthsLeft: 36 - elapsed,
  }
}

function fmtUSD(v) {
  if (typeof v !== 'number' || isNaN(v)) return '$0.00'
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── inline editable field ─────────────────────────────────────────────────────

function InlineEdit({ value, onChange, placeholder, className = '', type = 'text', step }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(value)

  function commit() {
    setEditing(false)
    if (local !== value) onChange(type === 'number' ? parseFloat(local) || 0 : local)
  }

  if (editing) {
    return (
      <input
        autoFocus
        type={type}
        step={step}
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        className={`rounded bg-white/10 px-1 py-0.5 text-white outline-none ring-1 ring-blue-400 ${className}`}
      />
    )
  }
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={() => { setLocal(value); setEditing(true) }}
      onKeyDown={e => { if (e.key === 'Enter') { setLocal(value); setEditing(true) } }}
      className={`cursor-text hover:underline decoration-dotted ${className}`}
      title="Click to edit"
    >
      {value || <span className="opacity-40">{placeholder}</span>}
    </span>
  )
}

// ── image uploader circle / square ────────────────────────────────────────────

function ImageUploader({ id, hasImage, onUpload, shape = 'circle', size = 'sm' }) {
  const ref = useRef()
  const ts = Date.now()
  const sizeClass = size === 'sm' ? 'h-10 w-10' : 'h-24 w-24'
  const url = hasImage ? `/api/images/${id}?t=${ts}` : null

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const data = await readFileAsDataURL(file)
    onUpload(data)
  }

  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      className={`${sizeClass} shrink-0 overflow-hidden border-2 border-dashed border-white/20 bg-white/5 hover:border-blue-400/60 transition-colors flex items-center justify-center ${shape === 'circle' ? 'rounded-full' : 'rounded-xl'}`}
      title="Click to upload image"
    >
      {url
        ? <img src={url} alt="logo" className="h-full w-full object-cover" />
        : <svg className="h-4 w-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
      }
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </button>
  )
}

// ── toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-emerald-500' : 'bg-white/15'}`}
      title={label}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
    </button>
  )
}

// ── AI provider card ──────────────────────────────────────────────────────────

function AICard({ item, onUpdate, onDelete, onUploadLogo }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
      <ImageUploader
        id={item.id}
        hasImage={item.hasLogo}
        onUpload={data => onUploadLogo(item.id, data)}
        shape="circle"
        size="sm"
      />

      <div className="min-w-0 flex-1 space-y-0.5">
        <InlineEdit
          value={item.name}
          onChange={name => onUpdate(item.id, { name })}
          placeholder="Provider name"
          className="block text-sm font-semibold text-white"
        />
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <span>$</span>
          <InlineEdit
            value={String(item.amount)}
            onChange={amount => onUpdate(item.id, { amount })}
            placeholder="10"
            type="number"
            step="0.01"
            className="w-16 text-slate-300"
          />
          <span>/mo</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-medium ${item.applied ? 'text-emerald-400' : 'text-slate-500'}`}>
            {item.applied ? 'Applied' : 'Not applied'}
          </span>
          <Toggle checked={item.applied} onChange={v => onUpdate(item.id, { applied: v })} label="Toggle applied" />
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="text-slate-500 hover:text-red-400 transition-colors"
          title="Delete"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── laptop card ───────────────────────────────────────────────────────────────

function LaptopCard({ item, onUpdate, onDelete, onUploadImage }) {
  const stats = calcLaptopStats(item)
  const pct = Math.round((stats.monthsElapsed / 36) * 100)

  return (
    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
      <div className="flex gap-4 p-4">
        <ImageUploader
          id={item.id}
          hasImage={item.hasImage}
          onUpload={data => onUploadImage(item.id, data)}
          shape="square"
          size="lg"
        />

        <div className="flex-1 min-w-0 space-y-1">
          <InlineEdit
            value={item.name}
            onChange={name => onUpdate(item.id, { name })}
            placeholder="Laptop name"
            className="block text-base font-bold text-white"
          />

          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-400">
            {[
              { label: 'RAM', key: 'ram' },
              { label: 'SSD', key: 'ssd' },
              { label: 'GPU', key: 'gpu' },
              { label: 'CPU', key: 'processor' },
            ].map(({ label, key }) => (
              <div key={key} className="flex items-center gap-1">
                <span className="shrink-0 text-slate-500">{label}:</span>
                <InlineEdit
                  value={item[key]}
                  onChange={val => onUpdate(item.id, { [key]: val })}
                  placeholder="—"
                  className="text-slate-300 truncate"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs pt-1">
            <div className="flex items-center gap-1 text-slate-400">
              <span>Total:</span>
              <span className="text-white font-semibold">$</span>
              <InlineEdit
                value={String(item.totalAmount)}
                onChange={totalAmount => onUpdate(item.id, { totalAmount })}
                placeholder="0"
                type="number"
                step="1"
                className="w-20 text-white font-semibold"
              />
            </div>
            <div className="text-slate-400">
              <span className="text-emerald-400 font-semibold">{fmtUSD(item.monthlyAmount)}</span>
              <span>/mo × 36</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Start:</span>
            <input
              type="month"
              value={item.startDate}
              onChange={e => onUpdate(item.id, { startDate: e.target.value })}
              className="rounded bg-white/10 px-1 py-0.5 text-white text-xs outline-none ring-1 ring-transparent focus:ring-blue-400"
            />
          </div>
        </div>

        <button
          onClick={() => onDelete(item.id)}
          className="self-start text-slate-500 hover:text-red-400 transition-colors shrink-0"
          title="Delete"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {item.startDate && (
        <div className="border-t border-white/10 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Month {stats.monthsElapsed} of 36</span>
            <span>{pct}% complete</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Reimbursed</p>
              <p className="text-xs font-bold text-emerald-400">{fmtUSD(stats.totalReimbursed)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Remaining</p>
              <p className="text-xs font-bold text-amber-400">{fmtUSD(stats.remaining)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Months left</p>
              <p className="text-xs font-bold text-white">{stats.monthsLeft}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── main panel ────────────────────────────────────────────────────────────────

export default function ReimbursementsPanel({
  aiItems, laptopItems,
  onAddAI, onUpdateAI, onDeleteAI, onUploadAILogo,
  onAddLaptop, onUpdateLaptop, onDeleteLaptop, onUploadLaptopImage,
}) {
  const [open, setOpen] = useState(true)

  const appliedAI = aiItems.filter(i => i.applied)
  const totalAI = appliedAI.reduce((s, i) => s + i.amount, 0)
  const totalLaptop = laptopItems.reduce((s, i) => s + i.monthlyAmount, 0)

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
            <svg className="h-4 w-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Reimbursements</h3>
            {(appliedAI.length > 0 || laptopItems.length > 0) && (
              <p className="text-xs text-slate-400">
                {appliedAI.length > 0 && <span className="text-violet-400">{fmtUSD(totalAI)}/mo AI</span>}
                {appliedAI.length > 0 && laptopItems.length > 0 && <span className="mx-1">·</span>}
                {laptopItems.length > 0 && <span className="text-emerald-400">{fmtUSD(totalLaptop)}/mo laptop</span>}
              </p>
            )}
          </div>
        </div>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-white/10 px-5 pb-5 space-y-5">

          {/* AI Subscriptions */}
          <section className="space-y-2 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">AI Subscriptions</h4>
                {appliedAI.length > 0 && (
                  <p className="text-[11px] text-violet-400">{appliedAI.length} applied · {fmtUSD(totalAI)}/mo</p>
                )}
              </div>
              <button
                onClick={() => onAddAI({ name: 'New Provider', amount: 10 })}
                className="flex items-center gap-1 rounded-lg bg-violet-500/15 px-2.5 py-1.5 text-xs font-medium text-violet-300 hover:bg-violet-500/25 transition-colors"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            </div>

            {aiItems.length === 0 && (
              <p className="text-xs text-slate-500 italic">No AI subscriptions yet. Add one to track reimbursements.</p>
            )}

            <div className="space-y-2">
              {aiItems.map(item => (
                <AICard
                  key={item.id}
                  item={item}
                  onUpdate={onUpdateAI}
                  onDelete={onDeleteAI}
                  onUploadLogo={onUploadAILogo}
                />
              ))}
            </div>
          </section>

          {/* Laptop */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Laptop</h4>
                {laptopItems.length > 0 && (
                  <p className="text-[11px] text-emerald-400">{fmtUSD(totalLaptop)}/mo · 36-month plan</p>
                )}
              </div>
              <button
                onClick={() => onAddLaptop({ name: 'New Laptop', totalAmount: 0 })}
                className="flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/25 transition-colors"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            </div>

            {laptopItems.length === 0 && (
              <p className="text-xs text-slate-500 italic">No laptop reimbursement yet. Add one to track your 36-month plan.</p>
            )}

            <div className="space-y-3">
              {laptopItems.map(item => (
                <LaptopCard
                  key={item.id}
                  item={item}
                  onUpdate={onUpdateLaptop}
                  onDelete={onDeleteLaptop}
                  onUploadImage={onUploadLaptopImage}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
