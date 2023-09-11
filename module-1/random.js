const DEFAULT_FIRST_NUMBER = 7
const DEFAULT_SECOND_NUMBER = 39

const getNumbers = (numbs) => {
	if (!numbs) {
		return [DEFAULT_FIRST_NUMBER, DEFAULT_SECOND_NUMBER]
	}

	const separator = ' '
	const arr = numbs.split(separator).map(Number)

	if (arr.length !== 2 || isNaN(arr[0]) || isNaN(arr[1])) {
		return [DEFAULT_FIRST_NUMBER, DEFAULT_SECOND_NUMBER]
	}

	const [first, second] = arr.sort((a, b) => a - b)

	return [first, second]
}

const getRandomNumber = (numbs) => {
	const [first, second] = getNumbers(numbs)
	const randomNumber = Math.floor(Math.random() * (second - first) + first)

	return [first, second, randomNumber]
}

module.exports = { getNumbers, getRandomNumber }
