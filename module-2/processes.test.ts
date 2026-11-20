import { describe, expect, it } from 'bun:test'
import { formatProcessInfo, parseProcessInfo, parseUnix, parseWindows } from './processes.ts'

describe('parseWindows', () => {
  it('divides the CPU time by the number of cores and converts bytes to MB', () => {
    expect(parseWindows('Code 50 524288000 8\r\n')).toEqual({
      name: 'Code',
      cpu: 6.25,
      memoryMb: 500,
    })
  })

  it('never reports more than 100%', () => {
    expect(parseWindows('busy 900 0 4')?.cpu).toBe(100)
  })

  it('gives null for unexpected output', () => {
    expect(parseWindows('')).toBeNull()
    expect(parseWindows('name not-a-number 1 1')).toBeNull()
  })
})

describe('parseUnix', () => {
  const output = [
    '  0.0   1024 /sbin/launchd',
    ' 12.5 204800 /Applications/Visual Studio Code.app/Contents/MacOS/Code Helper',
    '  3,4  51200 node',
    'garbage line',
  ].join('\n')

  it('picks the busiest process, keeps spaces in its name and converts KB to MB', () => {
    expect(parseUnix(output)).toEqual({ name: 'Code Helper', cpu: 12.5, memoryMb: 200 })
  })

  it('reads a decimal comma', () => {
    expect(parseUnix('  3,4  51200 node')).toEqual({ name: 'node', cpu: 3.4, memoryMb: 50 })
  })

  it('gives null when there are no processes', () => {
    expect(parseUnix('')).toBeNull()
  })
})

describe('formatProcessInfo', () => {
  it('formats one line for the terminal', () => {
    expect(formatProcessInfo(parseProcessInfo('unix', ' 7 2048 bun'))).toBe(
      'Most CPU-intensive process: bun | CPU: 7.00% | Memory: 2 MB',
    )
    expect(formatProcessInfo(null)).toBe('No processes found.')
  })
})
