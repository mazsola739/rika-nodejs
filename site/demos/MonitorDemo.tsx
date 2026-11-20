import { useState } from 'react'
import {
  formatProcessInfo,
  parseProcessInfo,
  UNIX_COMMAND,
  WINDOWS_COMMAND,
} from '../../module-2/processes.ts'
import { Card, cx, DemoTitle, Terminal } from '../components/ui.tsx'

const SAMPLES = {
  Windows: {
    platform: 'windows',
    command: WINDOWS_COMMAND.join(' '),
    output: 'Code 46 735051776 8',
  },
  macOS: {
    platform: 'unix',
    command: UNIX_COMMAND.join(' '),
    output: [
      '  0.0   9168 /sbin/launchd',
      ' 18.4 412160 /Applications/Visual Studio Code.app/Contents/Frameworks/Code Helper (Renderer).app/Contents/MacOS/Code Helper (Renderer)',
      '  6.1 203776 /Applications/Firefox.app/Contents/MacOS/firefox',
    ].join('\n'),
  },
  Linux: {
    platform: 'unix',
    command: UNIX_COMMAND.join(' '),
    output: ['  0.0  12288 /sbin/init', '  2.3 102400 bun', ' 31.7 524288 node'].join('\n'),
  },
} as const

type Os = keyof typeof SAMPLES

/**
 * The browser cannot list the processes of your computer, so this shows the other half: the
 * command the monitor runs, and how its parser turns the output into one line. Edit the output!
 */
export const MonitorDemo = () => {
  const [os, setOs] = useState<Os>('Windows')
  const [outputs, setOutputs] = useState<Record<Os, string>>({
    Windows: SAMPLES.Windows.output,
    macOS: SAMPLES.macOS.output,
    Linux: SAMPLES.Linux.output,
  })
  const sample = SAMPLES[os]
  const output = outputs[os]

  return (
    <Card>
      <DemoTitle note="A web page cannot see your processes, so here you can edit what the operating system answers, and watch the parser of the monitor read it.">
        The command and the parser
      </DemoTitle>

      <div role="tablist" aria-label="Operating system" className="mb-3 flex gap-1">
        {(Object.keys(SAMPLES) as Os[]).map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={os === name}
            onClick={() => setOs(name)}
            className={cx(
              'rounded-md px-3 py-1 text-sm',
              os === name
                ? 'bg-accent-soft font-medium text-accent'
                : 'text-muted hover:text-accent',
            )}
          >
            {name}
          </button>
        ))}
      </div>

      <p className="text-xs font-medium tracking-wide text-muted uppercase">The command</p>
      <pre className="mt-1 max-h-24 overflow-auto rounded-md bg-accent-soft p-2 font-mono text-[12px] break-all whitespace-pre-wrap text-ink">
        {sample.command}
      </pre>

      <label
        htmlFor="monitor-output"
        className="mt-3 block text-xs font-medium tracking-wide text-muted uppercase"
      >
        Its output
      </label>
      <textarea
        id="monitor-output"
        value={output}
        onChange={(event) => setOutputs((old) => ({ ...old, [os]: event.target.value }))}
        rows={4}
        spellCheck={false}
        className="mt-1 w-full resize-y rounded-md border border-line bg-page p-2 font-mono text-[12px]"
      />

      <Terminal title="bun run module-2" className="mt-3">
        <p className="px-4 py-3 text-term-green">
          {formatProcessInfo(parseProcessInfo(sample.platform, output))}
        </p>
      </Terminal>
    </Card>
  )
}
