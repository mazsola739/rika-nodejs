import type { ReactNode } from 'react'
import { ThemeToggle } from './components/ThemeToggle.tsx'
import { Card, ModuleSection } from './components/ui.tsx'
import {
  bugs,
  changes,
  type ModuleInfo,
  modules,
  ORIGINAL_2023,
  PORTFOLIO,
  REPO,
} from './content.ts'
import { CheckoutConsole } from './demos/CheckoutConsole.tsx'
import { CsvDemo } from './demos/CsvDemo.tsx'
import { DatabaseDemo } from './demos/DatabaseDemo.tsx'
import { EmitterDemo } from './demos/EmitterDemo.tsx'
import { HolidaysDemo } from './demos/HolidaysDemo.tsx'
import { MonitorDemo } from './demos/MonitorDemo.tsx'
import { ReplDemo } from './demos/ReplDemo.tsx'
import { UsersConsole } from './demos/UsersConsole.tsx'
import { WithTimeDemo } from './demos/WithTimeDemo.tsx'

const DEMOS: Record<number, ReactNode> = {
  1: <ReplDemo />,
  2: <MonitorDemo />,
  3: (
    <>
      <EmitterDemo />
      <WithTimeDemo />
      <CsvDemo />
    </>
  ),
  4: <HolidaysDemo />,
  5: <UsersConsole />,
  6: <CheckoutConsole />,
  7: <DatabaseDemo />,
}

const Header = () => (
  <header className="sticky top-0 z-10 border-b border-line bg-page/90 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
      <a href="#top" className="font-mono text-sm font-semibold">
        <span className="text-accent">&gt;_</span> rika-nodejs
      </a>
      <nav aria-label="Modules" className="ml-auto hidden md:block">
        <ul className="flex gap-1">
          {modules.map((info: ModuleInfo) => (
            <li key={info.id}>
              <a
                href={`#module-${info.id}`}
                title={info.title}
                className="grid size-8 place-items-center rounded-md font-mono text-sm text-muted hover:bg-accent-soft hover:text-accent"
              >
                {info.id}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <a
        href={REPO}
        className="ml-auto rounded-md border border-line px-3 py-1.5 text-sm hover:border-accent hover:text-accent md:ml-2"
      >
        GitHub
      </a>
      <ThemeToggle />
    </div>
  </header>
)

const Intro = () => (
  <div id="top" className="pt-12 pb-6 sm:pt-16">
    <p className="font-mono text-sm text-accent">
      EPAM Node.js Global Mentoring Program · autumn 2023
    </p>
    <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
      Seven home tasks, from a REPL to a database
    </h1>
    <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">
      My homework from a Node.js mentoring course, when I was a junior developer: every week a new
      part of Node, every task reviewed in a merge request. In 2026 I renovated it with strict
      TypeScript, Bun and tests for every module. Most of the code below{' '}
      <strong className="text-ink">runs right here in your browser</strong> – the same files as in
      the repository.
    </p>
    <div className="mt-6 flex flex-wrap gap-2">
      <a
        href={REPO}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-page hover:opacity-90"
      >
        Source code
      </a>
      <a
        href={ORIGINAL_2023}
        className="rounded-md border border-line bg-surface px-4 py-2 text-sm hover:border-accent hover:text-accent"
      >
        The code as it was in 2023
      </a>
      <a
        href={PORTFOLIO}
        className="rounded-md border border-line bg-surface px-4 py-2 text-sm hover:border-accent hover:text-accent"
      >
        Portfolio
      </a>
    </div>
  </div>
)

const Renovation = () => (
  <section id="renovation" aria-labelledby="renovation-title" className="py-10">
    <h2 id="renovation-title" className="text-2xl font-bold tracking-tight">
      2023 → 2026
    </h2>
    <div className="mt-4 grid gap-5 lg:grid-cols-2">
      <Card className="overflow-x-auto p-0 sm:p-0">
        <table className="w-full text-left text-sm">
          <thead className="text-xs tracking-wide text-muted uppercase">
            <tr className="border-b border-line">
              <th className="px-4 py-2 font-medium">2023</th>
              <th className="px-4 py-2 font-medium">2026</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {changes.map(([before, after]) => (
              <tr key={before}>
                <td className="px-4 py-2 text-muted">{before}</td>
                <td className="px-4 py-2">{after}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card>
        <h3 className="font-semibold">Bugs I found in my 2023 code</h3>
        <p className="mt-1 text-sm text-muted">
          Writing tests for every module brought these to light – each one has a test now.
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {bugs.map((bug) => (
            <li key={bug} className="flex gap-2">
              <span aria-hidden="true" className="text-accent">
                ✓
              </span>
              <span>{bug}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  </section>
)

export const App = () => (
  <>
    <a
      href="#module-1"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-20 focus:rounded focus:bg-surface focus:px-3 focus:py-2"
    >
      Skip to the modules
    </a>
    <Header />
    <main className="mx-auto max-w-6xl px-4">
      <Intro />
      <div className="divide-y divide-line">
        {modules.map((info) => (
          <ModuleSection key={info.id} info={info}>
            {DEMOS[info.id]}
          </ModuleSection>
        ))}
        <Renovation />
      </div>
    </main>
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-6 text-sm text-muted">
        <p>Rika · 2023, renovated in 2026</p>
        <p>
          <a href={REPO} className="hover:text-accent">
            GitHub
          </a>{' '}
          ·{' '}
          <a href={PORTFOLIO} className="hover:text-accent">
            Portfolio
          </a>
        </p>
      </div>
    </footer>
  </>
)
