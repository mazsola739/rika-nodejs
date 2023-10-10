import * as http from 'http'
import { routes } from './routes/userRoutes'

const port = 3000

const server = http.createServer((req, res) => {
	const path = req.url
	const method = req.method?.toUpperCase()
	const userUrl = path?.match(/\/users\/([0-9]+)/)
	let splitUrl = path?.split('/')

	if (method && (path === '/' || path === '/users')) {
		routes[path][method](req, res)
	} else if (method && userUrl && splitUrl && !splitUrl[3]) {
		let userId = splitUrl[2]
		routes['/users/id'][method](req, res, userId)
	} else if (method && path && userUrl && splitUrl && splitUrl[3]) {
		let userId = splitUrl[2]
		routes['/users/id/hobbies'][method](req, res, userId)
	} else {
		routes.notFound(req, res)
	}
})

server.listen(port, () => {
	console.log(`Server is running on port ${port}`)
})
