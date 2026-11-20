/** The range when `.random` gets no numbers, or numbers it cannot read. */
export const DEFAULT_RANGE: readonly [number, number] = [7, 39]

/**
 * Reads two whole numbers from the text after `.random`, in any order.
 * `'100 50'` → `[50, 100]`; empty or invalid input → `null`.
 */
export const parseRange = (input = ''): [number, number] | null => {
  const parts = input.trim().split(/\s+/).filter(Boolean).map(Number)
  if (parts.length !== 2 || !parts.every(Number.isSafeInteger)) return null

  const [a, b] = parts as [number, number]
  return a <= b ? [a, b] : [b, a]
}

/** A random whole number from `min` to `max`, both included. */
export const randomBetween = (min: number, max: number, rng: () => number = Math.random) =>
  Math.floor(rng() * (max - min + 1)) + min

export type RandomResult = { min: number; max: number; value: number; usedDefault: boolean }

export const random = (input = '', rng: () => number = Math.random): RandomResult => {
  const range = parseRange(input)
  const [min, max] = range ?? DEFAULT_RANGE
  return { min, max, value: randomBetween(min, max, rng), usedDefault: range === null }
}

export const HELP = 'To get a random number between two numbers, type ".random num1 num2"'

/** The text the REPL prints for `.random <input>`. */
export const describeRandom = ({ min, max, value, usedDefault }: RandomResult) =>
  `${usedDefault ? `No valid range given, so I used ${min} and ${max}.\n` : ''}Your random number between ${min} and ${max}: ${value}`
