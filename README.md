# PayPrecision - Salary Calculator

A production-ready salary calculator built with **React + Vite + Tailwind CSS v4**. Designed with a fintech-inspired dashboard UI featuring glassmorphism styling, dark/light themes, and real-time reactive calculations.

> **Built entirely with [Claude Code](https://claude.ai/claude-code)** - Anthropic's AI coding assistant.

## Features

- **Real-time salary calculation** - No "Calculate" button; results update reactively as you type
- **Overtime & leave offset logic** - Leave days offset extra working days; remaining extras paid at 1.5x overtime
- **Perfect attendance bonuses** - Multi-selectable toggles: 1 month (PKR 4,000), 3 months (PKR 10,000), 6 months (PKR 20,000)
- **Dynamic working days** - Auto-calculate weekdays in any month with public holiday subtraction
- **Invoice download** - Generate and download salary invoices as PDF
- **Annual revenue report** - Download yearly earnings summary
- **Earnings history** - Track and browse past calculations with localStorage persistence
- **Dark/Light theme** - Toggle with persistence across sessions
- **Glassmorphism UI** - Frosted glass cards, gradient backgrounds, smooth transitions
- **Formula breakdown panel** - Visual formula display with Base Sum, Adjustments, and Net Effect
- **Fully accessible** - WCAG AA compliant, keyboard navigable, screen-reader friendly
- **Copy to clipboard** - One-click copy of final salary
- **Reset to defaults** - Clear all inputs and localStorage

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool & dev server |
| Tailwind CSS v4 | Utility-first styling |
| localStorage | State persistence |

## Getting Started

### Prerequisites
- Node.js v18+ and npm

### Installation

```bash
git clone https://github.com/MuhammadAbdulMoiz/PayPrecision.git
cd PayPrecision
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Windows Background Server

Double-click `server.bat` or run it from terminal - it toggles the dev server on/off:
- First run: starts the Vite dev server in the background
- Second run: stops it

### Build for Production

```bash
npm run build
npm run preview
```

## Calculation Logic

```
monthlyPKR     = income * dollarRate
dailyWage      = monthlyPKR / workingDays
offsetDays     = min(leaveDays, extraDays)
overtimeDays   = extraDays - offsetDays
unpaidLeave    = leaveDays - offsetDays
extraPay       = overtimeDays * dailyWage * 1.5
leaveDeduction = unpaidLeave * dailyWage
finalSalary    = monthlyPKR + extraPay - leaveDeduction + attendanceBonus
```

## Project Structure

```
src/
├── App.jsx                    # Root component with all state and layout
├── components/
│   ├── BaseParameters.jsx     # Working days, income, dollar rate inputs
│   ├── BottomNav.jsx          # Dashboard / History tab navigation
│   ├── FormulaPanel.jsx       # Expandable formula breakdown
│   ├── Header.jsx             # App header with theme toggle
│   ├── HistoryPanel.jsx       # Earnings history list
│   ├── InputField.jsx         # Reusable number input with validation
│   ├── ResultCard.jsx         # Single result display card
│   ├── ResultsPanel.jsx       # All results container
│   ├── SelectField.jsx        # Reusable select dropdown
│   ├── SummaryCard.jsx        # Summary dashboard card
│   ├── ToggleSwitch.jsx       # Theme toggle switch
│   ├── VariablesAdjustments.jsx # Extra days, leave days, attendance
│   ├── WageArchitecture.jsx   # Wage breakdown display
│   └── MonthPicker.jsx        # Month selector for dynamic mode
├── hooks/
│   ├── useHistory.js          # Earnings history with localStorage
│   ├── useLocalStorage.js     # useState + localStorage sync
│   └── useWorkingDays.js      # Weekday counter for dynamic mode
└── utils/
    ├── calculate.js           # Pure salary calculation functions
    ├── format.js              # PKR currency formatter
    └── pdf.js                 # Invoice & report PDF generation
```

## License

MIT

---

*This project was built with [Claude Code](https://claude.ai/claude-code) by Anthropic.*
