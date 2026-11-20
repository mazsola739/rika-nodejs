import { useRef } from 'react'
import { createDispatcher } from '../../module-6/dispatch.ts'
import { ApiConsole, type Example } from './ApiConsole.tsx'

const USERS = [
  {
    label: '1ec6b2b6-… (user 1, cart: 1 opener, 3 candles)',
    value: '1ec6b2b6-38f6-493f-ac50-405c71e883ac',
  },
  {
    label: '5eced5ef-… (user 2, cart: 1 bloody hand)',
    value: '5eced5ef-9960-4d08-9b80-ff90c6f76a1c',
  },
  { label: 'fd258b95-… (user 3, cart: 1 lollipop)', value: 'fd258b95-848c-4ed0-82b8-ec68b32adc6b' },
  { label: 'an unknown user (→ 401)', value: '00000000-0000-4000-8000-000000000000' },
  { label: 'no header (→ 403)', value: '' },
]
const [USER_1] = USERS

const EXAMPLES: Example[] = [
  { label: 'GET products', method: 'GET', path: '/api/products', user: USER_1?.value },
  { label: 'GET cart', method: 'GET', path: '/api/profile/cart', user: USER_1?.value },
  {
    label: 'PUT 2 lollipops',
    method: 'PUT',
    path: '/api/profile/cart',
    body: { productId: '2c054cc1-7e53-4764-a378-c642b4de48da', count: 2 },
  },
  {
    label: 'PUT count 0',
    method: 'PUT',
    path: '/api/profile/cart',
    body: { productId: 'fae70882-0f1f-44d4-b238-6e29d065b148', count: 0 },
  },
  {
    label: 'Joi says no (400)',
    method: 'PUT',
    path: '/api/profile/cart',
    body: { productId: 'abc', count: 1.5 },
  },
  {
    label: 'checkout',
    method: 'POST',
    path: '/api/profile/cart/checkout',
    body: {
      delivery: { type: 'post', address: '1007 Mountain Drive, Gotham' },
      comments: 'Ring twice',
    },
  },
  { label: 'GET orders', method: 'GET', path: '/api/profile/orders' },
  { label: 'DELETE cart', method: 'DELETE', path: '/api/profile/cart' },
  { label: 'no header (403)', method: 'GET', path: '/api/products', user: '' },
  { label: '/teapot', method: 'GET', path: '/teapot' },
]

export const CheckoutConsole = () => {
  const api = useRef(createDispatcher())

  return (
    <ApiConsole
      title="Checkout API"
      note="The routes, middleware, Joi schemas and service of the Express app, dispatched in this tab without Express (a test checks that both answer the same)."
      send={(request) => api.current.dispatch(request)}
      reset={() => {
        api.current = createDispatcher()
      }}
      routes={api.current.routes}
      examples={EXAMPLES}
      users={USERS}
    />
  )
}
