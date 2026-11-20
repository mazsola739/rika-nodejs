import { type ReactNode, useEffect, useRef, useState } from 'react'
import { ThemeToggle } from './components/ThemeToggle.tsx'
import { Card, cx, ModuleSection } from './components/ui.tsx'
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
import { moduleHref, overviewHref, type Route, routeKey, useRoute } from './route.ts'

const SITE_TITLE = 'Node.js home tasks – Rika'

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

/** The top bar, and under it a tab for the overview and for every task. */
const Header = ({ route }: { route: Route }) => (
  <header className="sticky top-0 z-10 border-b border-line bg-page/90 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pt-3 pb-2">
      <a href={overviewHref} className="font-mono text-sm font-semibold">
        <span className="text-accent">&gt;_</span> rika-nodejs
      </a>
      <a
        href={REPO}
        className="ml-auto rounded-md border border-line px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
      >
        GitHub
      </a>
      <ThemeToggle />
    </div>
    <nav aria-label="Tasks" className="mx-auto max-w-6xl px-4">
      <ul className="-mb-px flex [scrollbar-width:none] gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <li>
          <Tab href={overviewHref} active={route.page === 'overview'}>
            All tasks
          </Tab>
        </li>
        {modules.map((info) => (
          <li key={info.id}>
            <Tab
              href={moduleHref(info.id)}
              active={route.page === 'module' && route.id === info.id}
            >
              <span className="font-mono">{info.id}</span>
              {/* Only the numbers fit on a narrow screen; screen readers always get the name. */}
              <span className="sr-only lg:not-sr-only">· {info.short}</span>
            </Tab>
          </li>
        ))}
      </ul>
    </nav>
  </header>
)

const Tab = ({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: ReactNode
}) => (
  <a
    href={href}
    aria-current={active ? 'page' : undefined}
    className={cx(
      'flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm whitespace-nowrap',
      active
        ? 'border-accent font-medium text-accent'
        : 'border-transparent text-muted hover:border-line hover:text-ink',
    )}
  >
    {children}
  </a>
)

const Intro = () => (
  <div className="pt-12 pb-8 sm:pt-16">
    <p className="font-mono text-sm text-accent">
      EPAM Node.js Global Mentoring Program · autumn 2023
    </p>
    <h1
      id="overview-title"
      tabIndex={-1}
      className="mt-2 max-w-3xl text-4xl font-bold tracking-tight focus:outline-none sm:text-5xl"
    >
      Seven home tasks, from a REPL to a database
    </h1>
    <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">
      My homework from a Node.js mentoring course, when I was a junior developer: every week a new
      part of Node, every task reviewed in a merge request. In 2026 I renovated it with strict
      TypeScript, Bun and tests for every module. Open a task: most of the code{' '}
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

const ModuleCard = ({ info }: { info: ModuleInfo }) => (
  <a
    href={moduleHref(info.id)}
    className="group flex flex-col rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent"
  >
    <div className="flex items-center justify-between">
      <span className="font-mono text-sm text-accent">Module {info.id}</span>
      <span
        aria-hidden="true"
        className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
      >
        →
      </span>
    </div>
    <h2 className="mt-1 text-lg leading-snug font-semibold group-hover:text-accent">
      {info.title}
    </h2>
    <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted">{info.summary}</p>
    <ul className="mt-auto flex flex-wrap gap-1.5 pt-4" aria-label="Topics">
      {info.topics.map((topic) => (
        <li key={topic} className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
          {topic}
        </li>
      ))}
    </ul>
    <p className="mt-3 border-t border-line pt-3 font-mono text-xs text-muted">
      <span className="text-accent">▶</span> {info.demo}
    </p>
  </a>
)

/** The eighth card: not a task, but the way to the story of the renovation. */
const RenovationCard = () => (
  <a
    href="#renovation"
    className="group flex flex-col justify-between rounded-xl border border-dashed border-line p-5 transition-colors hover:border-accent"
  >
    <div>
      <span className="font-mono text-sm text-accent">2023 → 2026</span>
      <h2 className="mt-1 text-lg leading-snug font-semibold group-hover:text-accent">
        What changed, and the bugs I found
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        The stack then and now, and five bugs from 2023 that the new tests brought to light.
      </p>
    </div>
    <p className="mt-4 text-sm text-accent">Read below ↓</p>
  </a>
)

const Overview = () => (
  <>
    <Intro />
    <section aria-label="The tasks" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {modules.map((info) => (
        <ModuleCard key={info.id} info={info} />
      ))}
      <RenovationCard />
    </section>
    <Renovation />
  </>
)

const Renovation = () => (
  <section id="renovation" aria-labelledby="renovation-title" className="scroll-mt-28 py-12">
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

/** Previous task · all tasks · next task, at the bottom of a task page. */
const Pager = ({ id }: { id: number }) => {
  const previous = modules.find((info) => info.id === id - 1)
  const next = modules.find((info) => info.id === id + 1)
  const link =
    'flex min-w-0 flex-1 flex-col rounded-xl border border-line bg-surface px-4 py-3 hover:border-accent'

  return (
    <nav aria-label="Other tasks" className="flex flex-wrap gap-3 border-t border-line py-8">
      {previous ? (
        <a href={moduleHref(previous.id)} className={link}>
          <span className="text-xs text-muted">← Module {previous.id}</span>
          <span className="truncate font-medium">{previous.title}</span>
        </a>
      ) : (
        <span className="hidden flex-1 sm:block" />
      )}
      <a
        href={overviewHref}
        className="flex items-center justify-center rounded-xl border border-line px-4 py-3 text-sm text-muted hover:border-accent hover:text-accent"
      >
        All tasks
      </a>
      {next ? (
        <a href={moduleHref(next.id)} className={cx(link, 'items-end text-right')}>
          <span className="text-xs text-muted">Module {next.id} →</span>
          <span className="truncate font-medium">{next.title}</span>
        </a>
      ) : (
        <span className="hidden flex-1 sm:block" />
      )}
    </nav>
  )
}

export const App = () => {
  const route = useRoute()
  const key = routeKey(route)
  const firstPage = useRef(true)

  // A task page stays mounted once opened (only hidden), so its REPL history or API data is
  // still there when the visitor comes back to it.
  const [opened, setOpened] = useState<number[]>([])
  if (route.page === 'module' && !opened.includes(route.id)) setOpened([...opened, route.id])

  useEffect(() => {
    const info =
      key === 'overview' ? undefined : modules.find((item) => `module-${item.id}` === key)
    document.title = info ? `Module ${info.id} · ${info.title} – ${SITE_TITLE}` : SITE_TITLE

    // An in-page anchor (#renovation) scrolls to its section; a new page starts at the top.
    const target =
      window.location.hash.length > 1 && document.getElementById(window.location.hash.slice(1))
    if (target) return target.scrollIntoView()
    // 'instant': a new page should not glide up from where the last one was left.
    window.scrollTo({ top: 0, behavior: 'instant' })

    // After a change of page (not on the first load), the focus moves to the new heading.
    if (firstPage.current) {
      firstPage.current = false
      return
    }
    document.getElementById(info ? `module-${info.id}-title` : 'overview-title')?.focus({
      preventScroll: true,
    })
  }, [key])

  return (
    <>
      <button
        type="button"
        onClick={() => document.getElementById('main')?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-20 focus:rounded focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to the content
      </button>
      <Header route={route} />
      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-4 focus:outline-none">
        {route.page === 'overview' && <Overview />}
        {modules
          .filter((info) => opened.includes(info.id))
          .map((info) => (
            <div key={info.id} hidden={!(route.page === 'module' && route.id === info.id)}>
              <ModuleSection info={info}>{DEMOS[info.id]}</ModuleSection>
              <Pager id={info.id} />
            </div>
          ))}
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
}
