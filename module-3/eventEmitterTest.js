const EventEmitter = require('./eventEmitter')

const emitter = new EventEmitter()

const c1 = () => console.log('an event occurred!')
const c2 = () => console.log('yet another event occurred!')

emitter.on('eventOne', c1)
emitter.on('eventOne', c2)
emitter.once('eventOnce', () => console.log('eventOnce occurred!'))
emitter.emit('eventOne')
emitter.emit('eventOnce')

console.log(emitter.listenerCount('eventOne'))
console.log(emitter.rawListeners('eventOne'))
