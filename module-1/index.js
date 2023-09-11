const repl = require('repl')
const { getRandomNumber } = require('./random')

console.log(
	'To get a random number between two numbers use ".random num1 num2"'
)

const replServer = repl.start('> ')

replServer.defineCommand('random', {
	help: 'To get a random number between two numbers use ".random num1 num2"',
	action(numbs) {
		this.clearBufferedCommand()
		const [first, second, randomNumber] = getRandomNumber(numbs)
		console.log(
			`Your random number between ${first}-${second}: ${randomNumber}`
		)
		this.displayPrompt()
	},
})
