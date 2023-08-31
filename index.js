const repl = require('repl')

console.log(
	'To get a random number between two numbers use ".random num1 num2"'
)

const getNumbers = (numbs) => {
	if (!numbs) {
		console.log('No input, your new numbers is: 7 39')
		return [7, 39]
	}

	const separator = ' '
	let arr

	if (~numbs.indexOf(separator)) {
		arr = numbs.split(separator).map(Number)
	} else {
		arr = [7, 39]
		console.log(`Wrong input, your new numbers is: ${arr[0]}-${arr[1]}`)
	}

	if (isNaN(arr[0])) {
		console.log('Wrong input, your new first number is: 7')
		arr[0] = 7
	}
	if (isNaN(arr[1])) {
		console.log('Wrong input, your new second number is: 39')
		arr[1] = 39
	}

	return arr
}

const getRandomNumber = (numbs) => {
	const [first, second] = getNumbers(numbs)
	const randomNumber = Math.floor(Math.random() * (second - first) + first)

	return [first, second, randomNumber]
}

const replServer = repl.start('> ')

replServer.defineCommand('random', {
	help: 'To get a random number between two numbers use ".random num1 num2"',
	action(numbs) {
		this.clearBufferedCommand()
		const [first, second, randomNumber] = getRandomNumber(numbs)
		console.log(`You random number between ${first}-${second}: ${randomNumber}`)
		this.displayPrompt()
	},
})
