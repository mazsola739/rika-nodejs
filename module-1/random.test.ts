import { describe, expect, it } from 'bun:test'
import { describeRandom, parseRange, random, randomBetween } from './random.ts'

describe('parseRange', () => {
  it('reads two whole numbers in any order', () => {
    expect(parseRange('50 100')).toEqual([50, 100])
    expect(parseRange('  100   50 ')).toEqual([50, 100])
    expect(parseRange('-5 5')).toEqual([-5, 5])
  })

  it('gives null for missing or invalid numbers', () => {
    for (const input of ['', '5', '1 2 3', 'a b', '1.5 3']) {
      expect(parseRange(input)).toBeNull()
    }
  })
})

describe('randomBetween', () => {
  it('can return both ends of the range', () => {
    expect(randomBetween(1, 6, () => 0)).toBe(1)
    expect(randomBetween(1, 6, () => 0.999999)).toBe(6)
  })

  it('stays inside the range', () => {
    for (let i = 0; i < 1000; i++) {
      const value = randomBetween(99, 102)
      expect(value).toBeGreaterThanOrEqual(99)
      expect(value).toBeLessThanOrEqual(102)
    }
  })
})

describe('random', () => {
  it('uses the default range and says so when the input is invalid', () => {
    expect(random('a b', () => 0)).toEqual({ min: 7, max: 39, value: 7, usedDefault: true })
    expect(random('7 39', () => 0).usedDefault).toBe(false)
    expect(describeRandom(random('', () => 0))).toStartWith('No valid range given')
  })

  it('describes the result', () => {
    expect(describeRandom(random('1 1'))).toBe('Your random number between 1 and 1: 1')
  })
})
