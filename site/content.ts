export const REPO = 'https://github.com/mazsola739/rika-nodejs'
export const PORTFOLIO = 'https://mazsola739.github.io/mazsola739/'
export const ORIGINAL_2023 = `${REPO}/tree/v2023`

export const sourceUrl = (path: string) => `${REPO}/blob/main/${path}`

export type ModuleInfo = {
  id: number
  title: string
  topics: string[]
  summary: string
  files: string[]
  run: string[]
}

export const modules: ModuleInfo[] = [
  {
    id: 1,
    title: 'Node.js introduction',
    topics: ['nvm', 'REPL', 'inspector'],
    summary:
      'Installing Node with a version manager, debugging with the inspector, and extending the REPL. My REPL got a .random command that picks a whole number between two numbers.',
    files: ['module-1/random.ts', 'module-1/repl.ts'],
    run: ['bun run module-1'],
  },
  {
    id: 2,
    title: 'The standard library',
    topics: ['child_process', 'os', 'fs'],
    summary:
      'An activity monitor: it asks the operating system for the most CPU-hungry process (PowerShell on Windows, ps on macOS and Linux), refreshes one terminal line every second and writes it to a log file every minute.',
    files: ['module-2/processes.ts', 'module-2/monitor.ts'],
    run: ['bun run module-2'],
  },
  {
    id: 3,
    title: 'EventEmitter, Buffer & Streams',
    topics: ['events', 'streams', 'Buffer'],
    summary:
      'My own EventEmitter, a WithTime class that times an async call with events, and a CSV-to-JSON converter that streams the file chunk by chunk instead of reading it whole.',
    files: [
      'module-3/event-emitter.ts',
      'module-3/with-time.ts',
      'module-3/csv.ts',
      'module-3/csv-stream.ts',
    ],
    run: ['bun run module-3:events', 'bun run module-3:time', 'bun run module-3:csv'],
  },
  {
    id: 4,
    title: 'Testing',
    topics: ['unit', 'mocks', 'end-to-end'],
    summary:
      'A small service for the Nager.Date public holidays API, with unit tests, a mocked fetch, and end-to-end tests against the live API.',
    files: ['module-4/holidays.ts', 'module-4/holidays.test.ts', 'module-4/nager-date.e2e.test.ts'],
    run: ['bun run module-4 NL', 'bun run test:e2e'],
  },
  {
    id: 5,
    title: 'Network',
    topics: ['node:http', 'REST', 'HATEOAS'],
    summary:
      'A REST API for users and their hobbies on plain node:http: routing, status codes, OPTIONS and 405, a Cache-Control header for the hobbies and links between the resources – all by hand.',
    files: ['module-5/users-api.ts', 'module-5/users-repository.ts', 'module-5/server.ts'],
    run: ['bun run module-5'],
  },
  {
    id: 6,
    title: 'Express & layered architecture',
    topics: ['Express 5', 'middleware', 'Joi'],
    summary:
      'A checkout service: products, one cart per user, orders. Router → middleware (the x-user-id header, Joi validation) → controller → service → store, with an OpenAPI description.',
    files: [
      'module-6/routes.ts',
      'module-6/app.ts',
      'module-6/checkout-service.ts',
      'module-6/store.ts',
      'module-6/openapi.yaml',
    ],
    run: ['bun run module-6'],
  },
  {
    id: 7,
    title: 'Databases',
    topics: ['SQL', 'SQLite', 'transactions'],
    summary:
      'The checkout service of module 6 with a real database: only the store is replaced, the routes, middleware and service stay the same. In 2023 this was an unfinished PostgreSQL + MikroORM draft; in 2026 I finished it with node:sqlite.',
    files: ['module-7/schema.ts', 'module-7/sqlite-store.ts', 'module-7/sqlite-store.test.ts'],
    run: ['bun run module-7'],
  },
]

export const changes: [string, string][] = [
  ['JavaScript in modules 1–3, loose TypeScript after', 'Strict TypeScript everywhere, ES modules'],
  [
    'npm, nodemon, ts-node, a package.json per module',
    'Bun: one package.json, TypeScript runs as it is',
  ],
  [
    'Jest and supertest, tests only for module 4',
    'bun:test for every module; the checkout tests run on both stores',
  ],
  ['axios, csvtojson, body-parser', 'fetch, my own streaming CSV parser, express.json()'],
  ['Express 4', 'Express 5, the routes described once as data'],
  [
    'Module 7: an unfinished PostgreSQL + MikroORM draft',
    'Finished with SQLite (node:sqlite), no Docker needed',
  ],
  ['Screenshots of the terminal in the repository', 'This page: the code runs in the browser'],
  ['GitLab merge requests', 'Biome, GitHub Actions and GitHub Pages'],
]

export const bugs: string[] = [
  'A once listener removed itself while emit was looping, so the next listener skipped its turn.',
  'The random number could never be the upper bound of the range.',
  'The monitor started a blocking PowerShell call every 100 ms, and on macOS / Linux it showed the memory percentage as megabytes.',
  'New users got users.length + 1 as id, so after a delete two users could share an id.',
  'A product could not be taken out of the cart (count had to be at least 1), although the API description asked for it.',
]
