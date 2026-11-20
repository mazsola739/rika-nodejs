/**
 * Module 2 – the standard library: an activity monitor in the terminal.
 * Shows the most CPU-intensive process on one line, refreshed every second,
 * and appends it to activity-monitor.log once a minute. Run: bun run module-2 (Ctrl+C to stop).
 */
import { execFile } from 'node:child_process'
import { appendFile } from 'node:fs/promises'
import { platform } from 'node:os'
import { promisify } from 'node:util'
import {
  formatProcessInfo,
  type Platform,
  parseProcessInfo,
  UNIX_COMMAND,
  WINDOWS_COMMAND,
} from './processes.ts'

const REFRESH_MS = 1_000
const LOG_EVERY_MS = 60_000
const LOG_FILE = new URL('./activity-monitor.log', import.meta.url)

const run = promisify(execFile)
const os: Platform = platform() === 'win32' ? 'windows' : 'unix'
const [command, ...args] = os === 'windows' ? WINDOWS_COMMAND : UNIX_COMMAND

const readBusiestProcess = async () => {
  const { stdout } = await run(command, args, { maxBuffer: 10 * 1024 * 1024, windowsHide: true })
  return formatProcessInfo(parseProcessInfo(os, stdout))
}

let lastLine = ''
let lastLoggedAt = 0

// The next reading starts only after the previous one has finished: the PowerShell call can take
// longer than the refresh interval, and readings must never pile up.
const tick = async () => {
  try {
    lastLine = await readBusiestProcess()
    process.stdout.write(`\r\x1b[2K${lastLine}`)

    if (Date.now() - lastLoggedAt >= LOG_EVERY_MS) {
      lastLoggedAt = Date.now()
      await appendFile(LOG_FILE, `${new Date().toISOString()}: ${lastLine}\n`)
    }
  } catch (error) {
    process.stdout.write(`\r\x1b[2KCould not read the processes: ${(error as Error).message}`)
  }
  setTimeout(tick, REFRESH_MS)
}

process.on('SIGINT', () => {
  process.stdout.write('\n')
  process.exit(0)
})

tick()
