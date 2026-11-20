/**
 * Module 3 – my own EventEmitter, with the most used methods of Node's `events.EventEmitter`.
 * Typed: `new EventEmitter<{ login: [user: string] }>()` only accepts listeners that take a string.
 */
export type EventMap = Record<string, unknown[]>

type Listener<Args extends unknown[]> = (...args: Args) => void
/** Any listener fits in here (a function that takes `never` accepts every parameter list). */
type AnyListener = (...args: never) => void
/** What is stored: the listener itself, or the wrapper `once` makes (it remembers the original). */
type Stored = AnyListener & { listener?: AnyListener }

export class EventEmitter<Events extends EventMap = Record<string, unknown[]>> {
  readonly #listeners = new Map<keyof Events, Stored[]>()

  addListener<E extends keyof Events>(event: E, listener: Listener<Events[E]>): this {
    const list = this.#listeners.get(event) ?? []
    list.push(listener)
    this.#listeners.set(event, list)
    return this
  }

  on<E extends keyof Events>(event: E, listener: Listener<Events[E]>): this {
    return this.addListener(event, listener)
  }

  /** Runs the listener on the next emit only. */
  once<E extends keyof Events>(event: E, listener: Listener<Events[E]>): this {
    const wrapper = Object.assign(
      (...args: Events[E]) => {
        this.removeListener(event, wrapper)
        listener(...args)
      },
      { listener },
    )
    return this.addListener(event, wrapper)
  }

  /** Removes the most recently added copy of the listener – also when it was added with `once`. */
  removeListener<E extends keyof Events>(event: E, listener: Listener<Events[E]>): this {
    const list = this.#listeners.get(event)
    if (!list) return this

    const target: AnyListener = listener
    const index = list.findLastIndex((stored) => stored === target || stored.listener === target)
    if (index !== -1) list.splice(index, 1)
    if (list.length === 0) this.#listeners.delete(event)
    return this
  }

  off<E extends keyof Events>(event: E, listener: Listener<Events[E]>): this {
    return this.removeListener(event, listener)
  }

  removeAllListeners(event?: keyof Events): this {
    if (event === undefined) this.#listeners.clear()
    else this.#listeners.delete(event)
    return this
  }

  /**
   * Calls the listeners in the order they were added. Returns false when nobody listens.
   * It loops over a copy: a `once` listener removes itself while the loop runs, and that must not
   * make the next listener skip its turn.
   */
  emit<E extends keyof Events>(event: E, ...args: Events[E]): boolean {
    const list = this.#listeners.get(event)
    if (!list?.length) return false

    for (const listener of [...list]) (listener as Listener<Events[E]>)(...args)
    return true
  }

  listenerCount(event: keyof Events): number {
    return this.#listeners.get(event)?.length ?? 0
  }

  /** The listeners, with `once` wrappers unwrapped. */
  listeners<E extends keyof Events>(event: E): Listener<Events[E]>[] {
    return (this.#listeners.get(event) ?? []).map(
      (stored) => (stored.listener ?? stored) as Listener<Events[E]>,
    )
  }

  /** The listeners as stored, `once` wrappers included. */
  rawListeners<E extends keyof Events>(event: E): Listener<Events[E]>[] {
    return (this.#listeners.get(event) ?? []).map((stored) => stored as Listener<Events[E]>)
  }

  eventNames(): (keyof Events)[] {
    return [...this.#listeners.keys()]
  }
}
