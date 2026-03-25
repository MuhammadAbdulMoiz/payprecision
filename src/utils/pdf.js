function fmt(v) {
  if (typeof v !== 'number' || isNaN(v)) return '---'
  return v.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function openPrintWindow(html, title) {
  const win = window.open('', '_blank', 'width=800,height=900')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.document.title = title
  win.onload = () => {
    setTimeout(() => win.print(), 300)
  }
}

const STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; padding: 40px; background: #fff; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
  .logo { font-size: 24px; font-weight: 800; color: #3b82f6; }
  .logo span { color: #1e293b; }
  .meta { text-align: right; font-size: 12px; color: #64748b; }
  .meta strong { color: #1e293b; font-size: 14px; display: block; margin-bottom: 4px; }
  h2 { font-size: 16px; color: #1e293b; margin: 24px 0 12px; text-transform: uppercase; letter-spacing: 1px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; padding: 8px 12px; border-bottom: 2px solid #e2e8f0; }
  td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
  td:last-child { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
  .total-row td { border-top: 2px solid #3b82f6; border-bottom: none; font-size: 16px; font-weight: 700; color: #3b82f6; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
  .badge-green { background: #dcfce7; color: #16a34a; }
  .badge-amber { background: #fef3c7; color: #d97706; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  .note { background: #f0f9ff; border-left: 3px solid #3b82f6; padding: 10px 14px; margin: 16px 0; font-size: 12px; color: #475569; border-radius: 0 6px 6px 0; }
  @media print { body { padding: 20px; } }
`

export function downloadInvoice(results, params) {
  const date = new Date()
  const invNum = `PP-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const html = `<!DOCTYPE html><html><head><style>${STYLES}</style></head><body>
    <div class="header">
      <div>
        <div class="logo">Pay<span>Precision</span></div>
        <p style="font-size:12px;color:#64748b;margin-top:4px">Salary Calculation Invoice</p>
      </div>
      <div class="meta">
        <strong>Invoice ${invNum}</strong>
        Date: ${dateStr}<br>
        Type: ${params.employeeType === 'intern' ? 'Intern' : 'Full-time'}
      </div>
    </div>

    <h2>Base Parameters</h2>
    <table>
      <tr><th>Parameter</th><th style="text-align:right">Value</th></tr>
      <tr><td>Monthly Income (USD)</td><td>$${fmt(parseFloat(params.income))}</td></tr>
      <tr><td>Dollar Rate (PKR)</td><td>PKR ${fmt(parseFloat(params.dollarRate))}</td></tr>
      <tr><td>Working Days</td><td>${params.workingDays} days</td></tr>
      <tr><td>Extra Working Days</td><td>${params.extraDays} days</td></tr>
      <tr><td>Leave Days</td><td>${params.leaveDays} days</td></tr>
    </table>

    ${results.offsetDays > 0 ? `<div class="note">${results.offsetDays} day(s) offset: leave and extra cancel out. ${results.remainingExtra > 0 ? results.remainingExtra + ' extra day(s) at 1.5x overtime.' : ''} ${results.remainingLeave > 0 ? results.remainingLeave + ' leave day(s) deducted.' : ''}</div>` : ''}

    <h2>Salary Breakdown</h2>
    <table>
      <tr><th>Component</th><th style="text-align:right">Amount (PKR)</th></tr>
      <tr><td>Base Salary (Income × Dollar Rate)</td><td>${fmt(results.monthlyPKR)}</td></tr>
      <tr><td>Daily Wage</td><td>${fmt(results.dailyWage)}</td></tr>
      <tr><td>Overtime Rate (1.5x)</td><td>${fmt(results.overtimeRate)}</td></tr>
      ${results.offsetDays > 0 ? `<tr><td>Leave-Extra Offset <span class="badge badge-amber">${results.offsetDays} days cancel out</span></td><td>0.00</td></tr>` : ''}
      <tr><td>Extra Pay (${results.remainingExtra} overtime day${results.remainingExtra !== 1 ? 's' : ''})</td><td style="color:#16a34a">+${fmt(results.extraPay)}</td></tr>
      <tr><td>Leave Deduction (${results.remainingLeave} day${results.remainingLeave !== 1 ? 's' : ''})</td><td style="color:#dc2626">-${fmt(results.leaveDeduction)}</td></tr>
      ${results.attendanceBonus > 0 ? `<tr><td>Perfect Attendance Bonus <span class="badge badge-green">BONUS</span></td><td style="color:#16a34a">+${fmt(results.attendanceBonus)}</td></tr>` : ''}
      <tr class="total-row"><td>Final Salary</td><td>PKR ${fmt(results.finalSalary)}</td></tr>
    </table>

    <div class="footer">
      Generated by PayPrecision &mdash; ${dateStr}<br>
      This is a calculated estimate. Actual payout may vary based on employer policies.
    </div>
  </body></html>`

  openPrintWindow(html, `PayPrecision Invoice ${invNum}`)
}

export function downloadAnnualReport(entries) {
  if (!entries.length) return

  const date = new Date()
  const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const totalEarnings = entries.reduce((sum, e) => sum + (e.results.finalSalary || 0), 0)
  const avgEarnings = totalEarnings / entries.length

  const rows = entries.map((e, i) => {
    const d = new Date(e.date)
    const month = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const inv = `#PP-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
    return `<tr>
      <td>${month}<br><span style="font-size:11px;color:#94a3b8">${inv}</span></td>
      <td>PKR ${fmt(e.results.finalSalary)}</td>
      <td><span class="badge badge-green">SAVED</span></td>
    </tr>`
  }).join('')

  const html = `<!DOCTYPE html><html><head><style>${STYLES}</style></head><body>
    <div class="header">
      <div>
        <div class="logo">Pay<span>Precision</span></div>
        <p style="font-size:12px;color:#64748b;margin-top:4px">Annual Revenue Report</p>
      </div>
      <div class="meta">
        <strong>Revenue Report</strong>
        Generated: ${dateStr}<br>
        Entries: ${entries.length}
      </div>
    </div>

    <h2>Summary</h2>
    <table>
      <tr><th>Metric</th><th style="text-align:right">Value</th></tr>
      <tr><td>Total Calculations</td><td>${entries.length}</td></tr>
      <tr><td>Total Earnings</td><td>PKR ${fmt(totalEarnings)}</td></tr>
      <tr><td>Average Earnings</td><td>PKR ${fmt(avgEarnings)}</td></tr>
      <tr><td>Highest Payout</td><td>PKR ${fmt(Math.max(...entries.map(e => e.results.finalSalary)))}</td></tr>
      <tr><td>Lowest Payout</td><td>PKR ${fmt(Math.min(...entries.map(e => e.results.finalSalary)))}</td></tr>
    </table>

    <h2>Earnings History</h2>
    <table>
      <tr><th>Billing Period</th><th style="text-align:right">Amount</th><th style="text-align:right">Status</th></tr>
      ${rows}
      <tr class="total-row"><td>Total</td><td>PKR ${fmt(totalEarnings)}</td><td></td></tr>
    </table>

    <div class="footer">
      Generated by PayPrecision &mdash; ${dateStr}<br>
      This report is based on saved calculation data. Actual payouts may differ.
    </div>
  </body></html>`

  openPrintWindow(html, 'PayPrecision Annual Revenue Report')
}
