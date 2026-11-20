import { describe, expect, it, mock } from 'bun:test'
import { EventEmitter } from './event-emitter.ts'

describe('EventEmitter', () => {
  it('calls the listeners in order, with the arguments', () => {
    const emitter = new EventEmitter<{ greet: [name: string] }>()
    const calls: string[] = []
    emitter.on('greet', (name) => calls.push(`first ${name}`))
    emitter.addListener('greet', (name) => calls.push(`second ${name}`))

    expect(emitter.emit('greet', 'Rika')).toBe(true)
    expect(calls).toEqual(['first Rika', 'second Rika'])
  })

  it('returns false when nobody listens', () => {
    expect(new EventEmitter().emit('nothing')).toBe(false)
  })

  it('runs a once listener only once', () => {
    const emitter = new EventEmitter()
    const listener = mock()
    emitter.once('ping', listener)

    emitter.emit('ping')
    emitter.emit('ping')
    expect(listener).toHaveBeenCalledTimes(1)
    expect(emitter.listenerCount('ping')).toBe(0)
  })

  it('does not skip the next listener when a once listener removes itself (the 2023 bug)', () => {
    const emitter = new EventEmitter()
    const after = mock()
    emitter.once('ping', () => {})
    emitter.on('ping', after)

    emitter.emit('ping')
    expect(after).toHaveBeenCalledTimes(1)
  })

  it('removes listeners with off, also the ones added with once', () => {
    const emitter = new EventEmitter()
    const listener = mock()
    emitter.on('ping', listener)
    emitter.once('ping', listener)

    emitter.off('ping', listener)
    expect(emitter.listenerCount('ping')).toBe(1)
    emitter.off('ping', listener)
    expect(emitter.emit('ping')).toBe(false)
    expect(listener).not.toHaveBeenCalled()
  })

  it('removing an unknown listener changes nothing', () => {
    const emitter = new EventEmitter()
    emitter.on('ping', () => {})
    emitter.off('ping', () => {})
    emitter.off('other', () => {})
    expect(emitter.listenerCount('ping')).toBe(1)
  })

  it('shows once wrappers in rawListeners, the originals in listeners', () => {
    const emitter = new EventEmitter()
    const listener = () => {}
    emitter.once('ping', listener)

    expect(emitter.listeners('ping')).toEqual([listener])
    expect(emitter.rawListeners('ping')[0]).not.toBe(listener)
    expect(emitter.eventNames()).toEqual(['ping'])
  })

  it('removes all listeners of an event, or of every event', () => {
    const emitter = new EventEmitter()
    emitter.on('a', () => {}).on('b', () => {})

    emitter.removeAllListeners('a')
    expect(emitter.eventNames()).toEqual(['b'])
    emitter.removeAllListeners()
    expect(emitter.eventNames()).toEqual([])
  })
})
