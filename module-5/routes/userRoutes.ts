import { setOptionsResponse, setResponse } from '../utils/responseHelper'

import * as userController from '../controllers/userController'
import { handleRequest } from '../utils/requestHelper'

export const routes = {
	'/': {
		GET: (_, res) => {
			setResponse(res, { data: { message: 'Server is running' } })
		},
	},
	'/users': {
		GET: userController.getUsersWithoutHobbies,
		POST: (req, res) => {
			handleRequest(req, res, userController.createUser)
		},
		PUT: (req, res) => {
			handleRequest(req, res, userController.updateUser)
		},
		OPTIONS: (_, res) => {
			setOptionsResponse(res, {
				options: 'GET, POST, PUT, OPTIONS',
			})
		},
	},
	'/users/id': {
		GET: userController.getUserWithoutHobbies,
		DELETE: userController.deleteUser,
	},
	'/users/id/hobbies': {
		GET: (req, res, userId) => {
			handleRequest(req, res, userController.getUserHobbies, userId)
		},
		DELETE: (req, res, userId) => {
			handleRequest(req, res, userController.deleteUserHobbies, userId)
		},
		PUT: (req, res, userId) => {
			handleRequest(req, res, userController.updateUserHobbies, userId)
		},
		OPTIONS: (_, res) => {
			setOptionsResponse(res, {
				options: 'GET, DELETE, PUT, OPTIONS',
			})
		},
	},
	notFound: (_, res) => {
		setResponse(res, {
			status: 404,
			data: { message: 'Requested resource not found!' },
		})
	},
}
