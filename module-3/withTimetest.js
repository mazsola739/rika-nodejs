const WithTime = require('./withTime')
const { getRandomNumber } = require('../module-1/random')

const URL = 'https://jsonplaceholder.typicode.com/posts'
const POST_ID = getRandomNumber()[2]

const withTime = new WithTime()

const fetchData = async (postId) => {
	const data = await fetch(`${URL}/${postId}`)

	return data.json()
}

withTime.on('begin', () => console.log('About to execute'))
withTime.on('data', (data) => console.log(data))
withTime.on('end', () => console.log('Done with execute'))

console.log(withTime.rawListeners('end'))

withTime.execute(fetchData, POST_ID)
