import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { type ModuleInfo, sourceUrl } from '../content.ts'

export const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ')

export const Button = ({
  variant = 'default',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'primary' | 'ghost' }) => (
  <button
    type="button"
    className={cx(
      'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
      variant === 'primary' && 'bg-accent text-page hover:opacity-90',
      variant === 'default' &&
        'border border-line bg-surface text-ink hover:border-accent hover:text-accent',
      variant === 'ghost' && 'text-muted hover:text-accent',
      className,
    )}
    {...props}
  />
)

/** A dark terminal panel, in both themes. */
export const Terminal = ({
  title,
  children,
  className,
}: {
  title?: string
  children: ReactNode
  className?: string
}) => (
  <div
    className={cx(
      'overflow-hidden rounded-lg border border-term-line bg-term text-term-ink',
      className,
    )}
  >
    <div className="flex items-center gap-1.5 border-b border-term-line px-3 py-2">
      <span className="size-2.5 rounded-full bg-term-red/80" />
      <span className="size-2.5 rounded-full bg-term-yellow/80" />
      <span className="size-2.5 rounded-full bg-term-green/80" />
      {title && <span className="ml-2 truncate font-mono text-xs text-term-muted">{title}</span>}
    </div>
    <div className="font-mono text-[13px] leading-relaxed">{children}</div>
  </div>
)

export const Card = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cx('rounded-xl border border-line bg-surface p-4 sm:p-5', className)}>
    {children}
  </div>
)

export const DemoTitle = ({ children, note }: { children: ReactNode; note?: ReactNode }) => (
  <div className="mb-3">
    <h3 className="text-base font-semibold">{children}</h3>
    {note && <p className="mt-0.5 text-sm text-muted">{note}</p>}
  </div>
)

/**
 * One module on its own page: the story, the files, the commands, and the demos.
 * The heading takes the focus when the page opens, so screen readers start there.
 */
export const ModuleSection = ({ info, children }: { info: ModuleInfo; children: ReactNode }) => (
  <section
    id={`module-${info.id}`}
    aria-labelledby={`module-${info.id}-title`}
    className="pt-8 pb-6"
  >
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <div>
        <p className="font-mono text-sm text-accent">Module {info.id} of 7</p>
        <h1
          id={`module-${info.id}-title`}
          tabIndex={-1}
          className="mt-1 text-3xl font-bold tracking-tight focus:outline-none"
        >
          {info.title}
        </h1>
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Topics">
          {info.topics.map((topic) => (
            <li key={topic} className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
              {topic}
            </li>
          ))}
        </ul>
        <p className="mt-3 leading-relaxed text-muted">{info.summary}</p>

        <h3 className="mt-4 text-sm font-semibold">Code</h3>
        <ul className="mt-1 space-y-0.5">
          {info.files.map((file) => (
            <li key={file}>
              <a
                href={sourceUrl(file)}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs break-all text-accent underline-offset-2 hover:underline"
              >
                {file}
              </a>
            </li>
          ))}
        </ul>

        <h3 className="mt-4 text-sm font-semibold">Run it</h3>
        <ul className="mt-1 space-y-1">
          {info.run.map((command) => (
            <li key={command}>
              <code className="rounded bg-term px-2 py-1 font-mono text-xs text-term-green">
                {command}
              </code>
            </li>
          ))}
        </ul>
      </div>
      <div className="min-w-0 space-y-5">{children}</div>
    </div>
  </section>
)
