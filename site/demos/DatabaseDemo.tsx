import { SCHEMA } from '../../module-7/schema.ts'
import { Card, DemoTitle, Terminal } from '../components/ui.tsx'

const LAYERS = [
  ['Router', 'routes.ts → Express routes', 'same'],
  ['Middleware', 'x-user-id check, Joi validation', 'same'],
  ['Controller', 'route handler → { data, error }', 'same'],
  ['Service', 'carts, totals, orders', 'same'],
  ['Store', 'CheckoutStore interface', 'memory → SQLite'],
] as const

export const DatabaseDemo = () => (
  <>
    <Card>
      <DemoTitle note="Module 7 swaps one layer. The checkout tests run twice – once on each store – and pass on both.">
        One layer changes
      </DemoTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="py-1.5 pr-3 font-medium">Layer</th>
              <th className="py-1.5 pr-3 font-medium">What it does</th>
              <th className="py-1.5 font-medium">Module 6 → 7</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {LAYERS.map(([layer, what, change]) => (
              <tr key={layer}>
                <td className="py-1.5 pr-3 font-medium">{layer}</td>
                <td className="py-1.5 pr-3 text-muted">{what}</td>
                <td
                  className={
                    change === 'same' ? 'py-1.5 text-muted' : 'py-1.5 font-semibold text-accent'
                  }
                >
                  {change}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Terminal title="bun test module-6" className="mt-4">
        <pre className="px-4 py-3 text-term-ink">
          {'module-6/checkout-api.test.ts:\n'}
          <span className="text-term-green">{'(pass)'}</span>
          {' checkout API in memory (module 6) > …   '}
          <span className="text-term-muted">14 tests</span>
          {'\n'}
          <span className="text-term-green">{'(pass)'}</span>
          {' checkout API in SQLite (module 7) > …   '}
          <span className="text-term-muted">14 tests</span>
          {'\n'}
          <span className="text-term-green">{'(pass)'}</span>
          {' the browser dispatcher > answers exactly like the Express app'}
        </pre>
      </Terminal>
    </Card>

    <Card>
      <DemoTitle note="Carts point to users, items to products; an order keeps a copy of the products as they were, so a later price change does not rewrite old orders. A partial unique index allows only one active cart per user.">
        The tables
      </DemoTitle>
      <Terminal title="module-7/schema.ts">
        <pre className="max-h-96 overflow-auto px-4 py-3 text-term-ink">{SCHEMA.trim()}</pre>
      </Terminal>
    </Card>
  </>
)
