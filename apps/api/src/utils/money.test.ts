import { describe, it, expect } from 'vitest'
import { roundHalfEven, calcSubtotal, calcTax } from './money'

// ---------------------------------------------------------------------------
// roundHalfEven — banker's rounding (ties go to nearest even integer)
// ---------------------------------------------------------------------------
describe('roundHalfEven', () => {
  it('rounds < .5 down', () => expect(roundHalfEven(1.4)).toBe(1))
  it('rounds > .5 up',   () => expect(roundHalfEven(1.6)).toBe(2))

  it('tie 2.5 → 2  (even floor wins)',  () => expect(roundHalfEven(2.5)).toBe(2))
  it('tie 3.5 → 4  (odd floor rounds up)', () => expect(roundHalfEven(3.5)).toBe(4))
  it('tie 36.5 → 36  (even)',  () => expect(roundHalfEven(36.5)).toBe(36))
  it('tie 109.5 → 110 (odd rounds up)', () => expect(roundHalfEven(109.5)).toBe(110))

  it('exact integer is unchanged', () => expect(roundHalfEven(42)).toBe(42))
  it('zero is unchanged',          () => expect(roundHalfEven(0)).toBe(0))
})

// ---------------------------------------------------------------------------
// calcSubtotal
// ---------------------------------------------------------------------------
describe('calcSubtotal', () => {
  it('sums quantity × unitPriceMinor', () => {
    expect(
      calcSubtotal([
        { quantity: 2, unitPriceMinor: 500 },
        { quantity: 1, unitPriceMinor: 1000 },
      ])
    ).toBe(2000)
  })

  it('single item', () => {
    expect(calcSubtotal([{ quantity: 3, unitPriceMinor: 333 }])).toBe(999)
  })

  it('returns 0 for empty list', () => {
    expect(calcSubtotal([])).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// calcTax with taxRateBps = 1825 (18.25%)
// This is the non-trivial case: subtotal values exist where the unrounded
// tax lands exactly on .5, so the choice of rounding algorithm is observable.
// ---------------------------------------------------------------------------
describe('calcTax — taxRateBps=1825', () => {
  const BPS = 1825

  it('subtotal=10000 → 1825.0 exactly (no rounding needed)', () => {
    // 10000 × 1825 / 10000 = 1825
    expect(calcTax(10000, BPS)).toBe(1825)
  })

  it('subtotal=200 → 36.5 → rounds DOWN to 36 (banker: 36 is even)', () => {
    // 200 × 1825 / 10000 = 36.5  — floor 36 is even, stays 36
    expect(calcTax(200, BPS)).toBe(36)
  })

  it('subtotal=600 → 109.5 → rounds UP to 110 (banker: 109 is odd)', () => {
    // 600 × 1825 / 10000 = 109.5  — floor 109 is odd, rounds to 110
    expect(calcTax(600, BPS)).toBe(110)
  })

  it('subtotal=10001 → 1825.1825 → 1825 (fractional, normal round)', () => {
    expect(calcTax(10001, BPS)).toBe(1825)
  })

  it('subtotal=54795 → 9999.9375 → 10000 (normal round up)', () => {
    // 54795 × 1825 / 10000 = 9999.9375
    expect(calcTax(54795, BPS)).toBe(10000)
  })
})

// ---------------------------------------------------------------------------
// calcTax — boundary / general cases
// ---------------------------------------------------------------------------
describe('calcTax — boundaries', () => {
  it('0 bps → always 0', () => {
    expect(calcTax(99999, 0)).toBe(0)
  })

  it('10000 bps (100%) → tax equals subtotal', () => {
    expect(calcTax(5000, 10000)).toBe(5000)
  })

  it('standard 18% (1800 bps) on round amount', () => {
    // 10000 × 1800 / 10000 = 1800 exactly
    expect(calcTax(10000, 1800)).toBe(1800)
  })

  it('1% (100 bps) on odd subtotal', () => {
    // 10001 × 100 / 10000 = 100.01 → 100
    expect(calcTax(10001, 100)).toBe(100)
  })
})
