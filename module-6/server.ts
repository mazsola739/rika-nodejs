/**
 * Module 6 – the checkout API on Express, with the data in memory. Run: bun run module-6, then e.g.
 * curl -H "x-user-id: 1ec6b2b6-38f6-493f-ac50-405c71e883ac" http://localhost:3030/api/profile/cart
 */
import { createApp } from './app.ts'

const port = Number(process.env.PORT ?? 3030)
createApp().listen(port, () => console.log(`Checkout API (in memory) on http://localhost:${port}`))
