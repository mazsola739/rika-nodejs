import { useEffect, useState } from 'react'
import {
  type Country,
  createHolidayService,
  type PublicHolidayShort,
  SUPPORTED_COUNTRIES,
} from '../../module-4/holidays.ts'
import { Card, cx, DemoTitle } from '../components/ui.tsx'

const service = createHolidayService()
const YEAR = new Date().getFullYear()

const NAMES: Record<Country, string> = {
  GB: 'United Kingdom',
  FR: 'France',
  DE: 'Germany',
  NL: 'Netherlands',
}

type State =
  | { status: 'loading' }
  | { status: 'done'; today: boolean; next: PublicHolidayShort[]; year: PublicHolidayShort[] }

const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

export const HolidaysDemo = () => {
  const [country, setCountry] = useState<Country>('NL')
  const [state, setState] = useState<State>({ status: 'loading' })
  const [showYear, setShowYear] = useState(false)

  useEffect(() => {
    let current = true
    setState({ status: 'loading' })
    Promise.all([
      service.checkIfTodayIsPublicHoliday(country),
      service.getNextPublicHolidays(country),
      service.getListOfPublicHolidays(YEAR, country),
    ]).then(([today, next, year]) => {
      if (current) setState({ status: 'done', today, next, year })
    })
    return () => {
      current = false
    }
  }, [country])

  const list = state.status === 'done' ? (showYear ? state.year : state.next) : []

  return (
    <Card>
      <DemoTitle note="The service from module 4, calling the live Nager.Date API from your browser.">
        Public holidays
      </DemoTitle>

      <fieldset className="flex flex-wrap gap-1">
        <legend className="sr-only">Country</legend>
        {SUPPORTED_COUNTRIES.map((code) => (
          <button
            key={code}
            type="button"
            aria-pressed={country === code}
            onClick={() => setCountry(code)}
            className={cx(
              'rounded-md border px-3 py-1 text-sm',
              country === code
                ? 'border-accent bg-accent-soft font-medium text-accent'
                : 'border-line text-muted hover:border-accent hover:text-accent',
            )}
          >
            {code} <span className="hidden sm:inline">· {NAMES[code]}</span>
          </button>
        ))}
      </fieldset>

      <div className="mt-4 min-h-64" aria-live="polite" aria-busy={state.status === 'loading'}>
        {state.status === 'loading' ? (
          <p className="text-sm text-muted">Asking Nager.Date…</p>
        ) : (
          <>
            <p className="text-sm">
              <span className="text-muted">checkIfTodayIsPublicHoliday('{country}') →</span>{' '}
              <strong className="font-mono">{String(state.today)}</strong>
              <span className="text-muted">
                {state.today ? ' – enjoy the day off!' : ' – a normal day.'}
              </span>
            </p>

            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="font-mono text-xs text-muted">
                {showYear
                  ? `getListOfPublicHolidays(${YEAR}, '${country}')`
                  : `getNextPublicHolidays('${country}')`}
              </p>
              <label className="inline-flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={showYear}
                  onChange={(event) => setShowYear(event.target.checked)}
                  className="accent-(--accent)"
                />
                all of {YEAR}
              </label>
            </div>

            {list.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                No holidays came back – the API may be unreachable right now.
              </p>
            ) : (
              <ul className="mt-2 max-h-64 divide-y divide-line overflow-y-auto rounded-md border border-line">
                {list.map((holiday) => (
                  <li
                    key={`${holiday.date}-${holiday.name}`}
                    className="flex flex-wrap justify-between gap-x-3 px-3 py-1.5 text-sm"
                  >
                    <span>
                      {holiday.name}
                      {holiday.localName !== holiday.name && (
                        <span className="text-muted"> · {holiday.localName}</span>
                      )}
                    </span>
                    <time
                      dateTime={holiday.date}
                      className="font-mono text-xs leading-5 text-muted"
                    >
                      {formatDate(holiday.date)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </Card>
  )
}
