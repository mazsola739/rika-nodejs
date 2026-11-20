/**
 * Module 2 – the standard library: which process uses the most CPU right now?
 * The commands are run by monitor.ts; the parsing lives here, so it can be tested on any OS
 * (and tried out on the project page).
 */

export type Platform = 'windows' | 'unix'

export type ProcessInfo = {
  name: string
  /** Share of the whole machine, 0–100. */
  cpu: number
  /** Memory in megabytes. */
  memoryMb: number
}

/**
 * Windows: the CPU % of every process from the performance counters, highest first.
 * PercentProcessorTime counts every core, so the parser divides it by the number of cores.
 */
export const WINDOWS_COMMAND = [
  'powershell.exe',
  '-NoProfile',
  '-Command',
  "Get-CimInstance Win32_PerfFormattedData_PerfProc_Process | Where-Object { $_.Name -notin '_Total','Idle' } | Sort-Object PercentProcessorTime -Descending | Select-Object -First 1 | ForEach-Object { \"$($_.Name) $($_.PercentProcessorTime) $($_.WorkingSetPrivate) $([Environment]::ProcessorCount)\" }",
] as const

/** macOS and Linux: CPU %, resident memory (KB) and command of every process. */
export const UNIX_COMMAND = ['ps', '-A', '-o', '%cpu=,rss=,comm='] as const

/** `"chrome 37 524288000 8"` → chrome, 37 / 8 cores, 500 MB. */
export const parseWindows = (output: string): ProcessInfo | null => {
  const [name, cpu, bytes, cores] = output.trim().split(/\s+/)
  const values = [cpu, bytes, cores].map(Number)
  if (!name || values.some(Number.isNaN)) return null

  const [cpuTotal, memoryBytes, coreCount] = values as [number, number, number]
  return {
    name,
    cpu: round(Math.min(cpuTotal / Math.max(coreCount, 1), 100)),
    memoryMb: Math.round(memoryBytes / 1024 / 1024),
  }
}

/** Every line of `ps`: `" 12.5 204800 /Applications/Code.app/…/Code Helper"`; picks the busiest. */
export const parseUnix = (output: string): ProcessInfo | null => {
  let busiest: ProcessInfo | null = null

  for (const line of output.split('\n')) {
    const match = line.trim().match(/^(\d+(?:[.,]\d+)?)\s+(\d+)\s+(.+)$/)
    if (!match) continue

    const [, cpu, rssKb, command] = match as unknown as [string, string, string, string]
    const info = {
      name: command.split('/').pop() || command,
      cpu: round(Number(cpu.replace(',', '.'))),
      memoryMb: Math.round(Number(rssKb) / 1024),
    }
    if (!busiest || info.cpu > busiest.cpu) busiest = info
  }

  return busiest
}

export const parseProcessInfo = (platform: Platform, output: string) =>
  platform === 'windows' ? parseWindows(output) : parseUnix(output)

export const formatProcessInfo = (info: ProcessInfo | null) =>
  info
    ? `Most CPU-intensive process: ${info.name} | CPU: ${info.cpu.toFixed(2)}% | Memory: ${info.memoryMb} MB`
    : 'No processes found.'

const round = (value: number) => Math.round(value * 100) / 100
