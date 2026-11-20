import { useRef } from 'react'
import { createUsersApi } from '../../module-5/users-api.ts'
import { ApiConsole, type Example } from './ApiConsole.tsx'

const EXAMPLES: Example[] = [
  { label: 'GET /users', method: 'GET', path: '/users' },
  { label: 'GET /users/1', method: 'GET', path: '/users/1' },
  { label: 'GET hobbies', method: 'GET', path: '/users/2/hobbies' },
  {
    label: 'POST /users',
    method: 'POST',
    path: '/users',
    body: { name: 'Storm', email: 'storm@email.com', hobbies: ['weather', 'flying'] },
  },
  { label: 'PATCH name', method: 'PATCH', path: '/users/4', body: { name: 'Wade Wilson' } },
  {
    label: 'add hobbies',
    method: 'POST',
    path: '/users/4/hobbies',
    body: { hobbies: ['chimichangas'] },
  },
  { label: 'remove a hobby', method: 'DELETE', path: '/users/1/hobbies/slapping Robin' },
  {
    label: 'same email (409)',
    method: 'POST',
    path: '/users',
    body: { name: 'Bruce', email: 'b-man@email.com' },
  },
  { label: 'OPTIONS', method: 'OPTIONS', path: '/users' },
  { label: 'PUT (405)', method: 'PUT', path: '/users/1/hobbies' },
]

export const UsersConsole = () => {
  const api = useRef(createUsersApi())

  return (
    <ApiConsole
      title="Users and hobbies API"
      note="The handlers of the node:http server, running in this tab with the same in-memory data. Changes stay until you reload the page."
      send={(request) => api.current.handle(request)}
      reset={() => {
        api.current = createUsersApi()
      }}
      routes={api.current.routes}
      examples={EXAMPLES}
    />
  )
}
