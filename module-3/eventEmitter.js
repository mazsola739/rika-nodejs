class EventEmitter {
	listeners = {}

	addListener(eventName, fn) {
		if (!this.listeners[eventName]) {
			this.listeners[eventName] = []
		}

		this.listeners[eventName].push(fn)
	}

	on(eventName, fn) {
		this.addListener(eventName, fn)
	}

	removeListener(eventName, fn) {
		if (!this.listeners[eventName]) {
			return
		}

		const index = this.listeners[eventName].indexOf(fn)

		if (index !== -1) {
			this.listeners[eventName].splice(index, 1)
		}
	}

	off(eventName, fn) {
		this.removeListener(eventName, fn)
	}

	once(eventName, fn) {
		const wrapper = (...args) => {
			this.removeListener(eventName, wrapper)
			fn(...args)
		}

		this.addListener(eventName, wrapper)
	}

	emit(eventName, ...args) {
		if (!this.listeners[eventName]) {
			return
		}

		this.listeners[eventName].forEach((fn) => fn(...args))
	}

	listenerCount(eventName) {
		if (!this.listeners[eventName]) {
			return 0
		}

		return this.listeners[eventName].length
	}

	rawListeners(eventName) {
		if (!this.listeners[eventName]) {
			return []
		}

		return this.listeners[eventName]
	}
}

module.exports = EventEmitter
