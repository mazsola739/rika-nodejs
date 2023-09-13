const EventEmitter = require('./eventEmitter')

class WithTime extends EventEmitter {
	async execute(asyncFunc, ...args) {
		this.emit('begin')

		const startTime = Date.now()
		const result = await asyncFunc(...args)
		const endTime = Date.now()

		this.emit('end')
		this.emit('data', result)

		console.log(`Time taken: ${endTime - startTime}ms`)
	}
}

module.exports = WithTime
