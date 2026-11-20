/** Module 3 – the EventEmitter in action. Run: bun run module-3:events */
import { EventEmitter } from './event-emitter.ts'

const emitter = new EventEmitter<{ eventOne: []; eventOnce: [] }>()

const first = () => console.log('an event occurred!')
const second = () => console.log('yet another event occurred!')

emitter.on('eventOne', first)
emitter.on('eventOne', second)
emitter.once('eventOnce', () => console.log('eventOnce occurred!'))

emitter.emit('eventOne')
emitter.emit('eventOnce')
console.log('emit eventOnce again →', emitter.emit('eventOnce'), '(nobody listens any more)')

console.log('listeners of eventOne:', emitter.listenerCount('eventOne'))
emitter.off('eventOne', first)
console.log('after off:', emitter.listenerCount('eventOne'))
emitter.emit('eventOne')
