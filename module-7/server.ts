/**
 * Module 7 – the checkout API of module 6, with the data in SQLite: carts and orders survive a
 * restart. Run: bun run module-7 (the database file is module-7/data/checkout.db;
 * delete it to start again from the seed data).
 */
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createApp } from '../module-6/app.ts'
import { createSqliteStore } from './sqlite-store.ts'

const dataDir = fileURLToPath(new URL('./data/', import.meta.url))
mkdirSync(dataDir, { recursive: true })
const file = process.env.DB_FILE ?? `${dataDir}checkout.db`

const port = Number(process.env.PORT ?? 3030)
createApp(createSqliteStore(file)).listen(port, () =>
  console.log(`Checkout API (SQLite: ${file}) on http://localhost:${port}`),
)
