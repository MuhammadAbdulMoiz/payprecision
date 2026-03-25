export function formatPKR(value) {
  if (typeof value !== 'number' || isNaN(value)) return '---'
  return value.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatUSD(value) {
  if (typeof value !== 'number' || isNaN(value)) return '---'
  return '$' + value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
