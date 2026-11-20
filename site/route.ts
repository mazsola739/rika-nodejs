import { useEffect, useState } from 'react'
import { modules } from './content.ts'

/**
 * Hash routing, so every page works on GitHub Pages and can be shared:
 * `#/` is the overview with the cards, `#/module-3` shows module 3 only.
 * Any other hash (e.g. `#renovation`) stays on the overview.
 */
export type Route = { page: 'overview' } | { page: 'module'; id: number }

export const overviewHref = '#/'
export const moduleHref = (id: number) => `#/module-${id}`

export const parseHash = (hash: string): Route => {
  const id = Number(hash.match(/^#\/?module-(\d+)$/)?.[1])
  return modules.some((info) => info.id === id) ? { page: 'module', id } : { page: 'overview' }
}

export const routeKey = (route: Route) =>
  route.page === 'module' ? `module-${route.id}` : 'overview'

export const useRoute = (): Route => {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
