/** The tables of the checkout database (plain SQL, also shown on the project page). */
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  price       REAL NOT NULL CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS carts (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users (id),
  is_deleted INTEGER NOT NULL DEFAULT 0
);

-- A user can have many deleted carts, but only one active cart.
CREATE UNIQUE INDEX IF NOT EXISTS carts_one_active_per_user ON carts (user_id) WHERE is_deleted = 0;

CREATE TABLE IF NOT EXISTS cart_items (
  cart_id    TEXT NOT NULL REFERENCES carts (id),
  product_id TEXT NOT NULL REFERENCES products (id),
  count      INTEGER NOT NULL CHECK (count > 0),
  PRIMARY KEY (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users (id),
  cart_id    TEXT NOT NULL REFERENCES carts (id),
  payment    TEXT NOT NULL, -- JSON
  delivery   TEXT NOT NULL, -- JSON
  comments   TEXT NOT NULL,
  status     TEXT NOT NULL CHECK (status IN ('created', 'completed')),
  total      REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- A copy of the product as it was when ordered: a later price change must not change old orders.
CREATE TABLE IF NOT EXISTS order_items (
  order_id    TEXT NOT NULL REFERENCES orders (id),
  product_id  TEXT NOT NULL REFERENCES products (id),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  price       REAL NOT NULL,
  count       INTEGER NOT NULL,
  PRIMARY KEY (order_id, product_id)
);
`
