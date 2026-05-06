export function roundHalfEven(value: number): number {
  const floor = Math.floor(value)
  const frac = value - floor
  if (frac === 0.5) {
    return floor % 2 === 0 ? floor : floor + 1
  }
  return Math.round(value)
}

export function calcSubtotal(lineItems: Array<{ quantity: number; unitPriceMinor: number }>): number {
  return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPriceMinor, 0)
}

export function calcTax(subtotalMinor: number, taxRateBps: number): number {
  return roundHalfEven((subtotalMinor * taxRateBps) / 10000)
}

export function fmtMoney(minor: number, currency: string): string {
  return (minor / 100).toFixed(2) + ' ' + currency
}
