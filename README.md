# Node.js Mentoring

Seven home tasks, from a REPL to a database: my homework from the **EPAM Node.js Global Mentoring
Program** in autumn 2023, when I was a junior developer – renovated in 2026.

**Live:** <https://mazsola739.github.io/rika-nodejs/> · **Portfolio:** <https://mazsola739.github.io/mazsola739/>

Every week brought a new part of Node, and every task was reviewed in a merge request. In 2026 I
rebuilt the repository with strict TypeScript and Bun, wrote tests for every module, finished the
database task I had left as a draft, and made a page where most of the code runs in the browser –
the same files, imported by the page. The commits from 2023 are still here; the original state is
tagged [`v2023`](../../tree/v2023).

## The modules

| Module                             | What I built                                                                                                       | Run it                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| 1 · Node.js introduction           | A REPL with a `.random` command                                                                                    | `bun run module-1`                           |
| 2 · The standard library           | An activity monitor: the most CPU-hungry process (PowerShell / `ps`), refreshed every second, logged every minute  | `bun run module-2`                           |
| 3 · EventEmitter, Buffer & Streams | My own typed EventEmitter, a `WithTime` class that times async calls with events, a streaming CSV → JSON converter | `bun run module-3:events` / `:time` / `:csv` |
| 4 · Testing                        | A service for the [Nager.Date](https://date.nager.at) holidays API: unit tests, a mocked `fetch`, live e2e tests   | `bun run module-4 NL`, `bun run test:e2e`    |
| 5 · Network                        | A REST API for users and hobbies on plain `node:http`: routing, status codes, `OPTIONS` / 405, caching, links      | `bun run module-5` → `localhost:3000/users`  |
| 6 · Express & layered architecture | A checkout API: router → middleware (auth, Joi) → controller → service → store, with an OpenAPI description        | `bun run module-6` → `localhost:3030`        |
| 7 · Databases                      | The checkout API of module 6 on SQLite (`node:sqlite`): only the store changes                                     | `bun run module-7`                           |

The checkout API needs an `x-user-id` header with one of the users in
[`module-6/data/users.json`](module-6/data/users.json), for example:

```bash
curl -H "x-user-id: 1ec6b2b6-38f6-493f-ac50-405c71e883ac" http://localhost:3030/api/profile/cart
```

### One API, three ways to run it

The handlers of modules 5 and 6 are plain functions: a request object in, a response object out
([`shared/http.ts`](shared/http.ts)). The endpoints of the checkout API are described once, as data
([`module-6/routes.ts`](module-6/routes.ts)):

- [`module-6/app.ts`](module-6/app.ts) turns them into Express routes with real middleware,
- [`module-7/server.ts`](module-7/server.ts) runs the same app on a SQLite store,
- [`module-6/dispatch.ts`](module-6/dispatch.ts) runs them without Express, in the browser console of
  the project page – and a test checks that it answers exactly like the Express app.

The checkout tests run twice, once on the in-memory store and once on SQLite, and pass on both.

### What changed since 2023

| 2023                                                | 2026                                                           |
| --------------------------------------------------- | -------------------------------------------------------------- |
| JavaScript in modules 1–3, loose TypeScript after   | Strict TypeScript everywhere, ES modules                       |
| npm, nodemon, ts-node, a `package.json` per module  | Bun: one `package.json`, TypeScript runs as it is              |
| Jest and supertest, tests only for module 4         | `bun:test` for every module, the checkout tests on both stores |
| axios, csvtojson, body-parser                       | `fetch`, my own streaming CSV parser, `express.json()`         |
| Express 4                                           | Express 5, the routes described once as data                   |
| Module 7: an unfinished PostgreSQL + MikroORM draft | Finished with SQLite (`node:sqlite`), no Docker needed         |
| Screenshots of the terminal in the repository       | A project page where the code runs in the browser              |
| GitLab merge requests                               | Biome, GitHub Actions and GitHub Pages                         |

### Bugs I found in my 2023 code

Writing tests for every module brought these to light; each one has a test now.

- A `once` listener removed itself while `emit` was looping, so the next listener skipped its turn.
- The random number could never be the upper bound of the range.
- The monitor started a blocking PowerShell call every 100 ms, and on macOS / Linux it showed the
  memory percentage as megabytes.
- New users got `users.length + 1` as id, so after a delete two users could share an id.
- A product could not be taken out of the cart (`count` had to be at least 1), although the API
  description asked for it.

## Stack

[Bun](https://bun.sh) · TypeScript · Node.js APIs (`node:http`, `node:stream`, `node:child_process`,
`node:sqlite`, …) · [Express 5](https://expressjs.com) · [Joi](https://joi.dev) · `bun:test` ·
[Biome](https://biomejs.dev) · the project page: React 19, [Vite](https://vite.dev) and
[Tailwind CSS 4](https://tailwindcss.com)

The modules only use `node:` APIs, so they run on Node.js 24 as well, which runs TypeScript files
as they are: e.g. `node module-5/server.ts`.

## Run locally

```bash
bun install
bun run test
```

| Script              | What it does                                                   |
| ------------------- | -------------------------------------------------------------- |
| `bun run module-…`  | runs a module (see the table above)                            |
| `bun run test`      | every test (the live API tests are skipped)                    |
| `bun run test:e2e`  | the end-to-end tests against the live Nager.Date API           |
| `bun run dev`       | the project page with hot reload                               |
| `bun run build`     | type check + production build of the page into `dist/`         |
| `bun run typecheck` | TypeScript check only                                          |
| `bun run lint`      | Biome: lint, formatting, import order and Tailwind class order |
| `bun run format`    | apply every safe Biome fix and format the code                 |

## Project structure

```
module-1 … module-7   the home tasks, each with its tests next to the code
shared/http.ts        request / response types and path matching for modules 5 and 6
site/                 the project page (React), importing the modules
index.html            the entry of the page
```

Every push to `main` is linted, type checked, tested, built and published to GitHub Pages by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
