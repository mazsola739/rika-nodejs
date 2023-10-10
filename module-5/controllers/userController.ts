import * as userService from '../services/userService'
import { setResponse } from '../utils/responseHelper'

export const getUsersWithoutHobbies = (_, res) => {
	try {
		const users = userService.getUsersWithoutHobbies()

		return setResponse(res, { data: users })
	} catch (error) {
		return setResponse(res, { status: 400, data: { message: error.message } })
	}
}

export const getUsersWithHobbies = (_, res) => {
	try {
		const users = userService.getUsersWithHobbies()

		return setResponse(res, { data: users })
	} catch (error) {
		return setResponse(res, { status: 400, data: { message: error.message } })
	}
}

export const getUserWithoutHobbies = (_, res, userId) => {
	try {
		const id = +userId
		const user = userService.getUserWithHobbies(id)

		if (!user) {
			return setResponse(res, {
				data: { message: 'User not found' },
				status: 400,
			})
		}

		const foundUser = userService.getUserWithoutHobbies(id)
		return setResponse(res, {
			data: {
				foundUser,
				_links: userService.linkToGetHobbies(id),
			},
			status: 200,
		})
	} catch (error) {
		return setResponse(res, { status: 400, data: { message: error.message } })
	}
}

export const getUserWithHobbies = (_, res, userId) => {
	try {
		const id = +userId
		const user = userService.getUserWithHobbies(id)

		if (!user) {
			return setResponse(res, {
				data: { message: 'User not found' },
				status: 400,
			})
		}

		const foundUser = userService.getUserWithoutHobbies(id)
		return setResponse(res, {
			data: {
				foundUser,
				_links: userService.linkToGetHobbies(id),
			},
			status: 200,
		})
	} catch (error) {
		return setResponse(res, { status: 400, data: { message: error.message } })
	}
}

export const createUser = (req, res) => {
	try {
		let body = req.body
		const users = userService.getUsersWithHobbies()
		const foundUser = users.find((user) => user.name === body.name)

		if (foundUser) {
			return setResponse(res, {
				data: { message: `User with '${body.name}' already exists!` },
				status: 409,
			})
		}

		const data = userService.createUser(body)
		return setResponse(res, {
			data: { message: 'User successfully created', users: data },
			status: 201,
		})
	} catch (error) {
		return setResponse(res, { status: 400, data: { message: error.message } })
	}
}

export const updateUser = (req, res) => {
	try {
		let body = req.body
		const users = userService.getUsersWithHobbies()
		const id = +body.id
		const foundUser = users.find((user) => user.id === id)

		if (!foundUser) {
			return setResponse(res, {
				data: { message: 'User not found' },
				status: 400,
			})
		}

		const user = userService.updateUser(id, body)
		return setResponse(res, {
			data: {
				user,
				_links: userService.linkToGetHobbies(id),
			},
			status: 201,
		})
	} catch (error) {
		return setResponse(res, { status: 400, data: { message: error.message } })
	}
}

export const deleteUser = (_, res, userId) => {
	try {
		let users = userService.getUsersWithoutHobbies()
		const id = +userId

		const foundUser = users.find((user) => user.id === id)
		if (!foundUser) {
			return setResponse(res, {
				data: { message: 'User not found' },
				status: 400,
			})
		}

		users = userService.deleteUser(id)

		return setResponse(res, {
			status: 200,
			data: { message: 'User successfully deleted', users: users },
		})
	} catch (error) {
		return setResponse(res, { status: 400, data: { message: error.message } })
	}
}

export const getUserHobbies = (_, res, userId) => {
	try {
		const users = userService.getUsersWithoutHobbies()
		const foundUser = users.find((user) => user.id === Number(userId))

		if (!foundUser) {
			return setResponse(res, {
				data: { message: 'User not found' },
				status: 400,
			})
		}

		const hobbies = userService.getListOfUserHobbies(Number(userId))
		return setResponse(res, { data: hobbies, status: 200 }, true)
	} catch (error) {
		return setResponse(res, { status: 400, data: { message: error.message } })
	}
}

export const updateUserHobbies = (req, res, userId) => {
	try {
		let body = req.body
		const users = userService.getUsersWithoutHobbies()
		const id = +userId
		const foundUser = users.find((user) => user.id === id)

		if (!foundUser) {
			return setResponse(res, {
				data: { message: 'User not found' },
				status: 400,
			})
		}

		const user = userService.updateUserHobbies(id, body.hobbies)
		return setResponse(res, {
			data: {
				user,
				_links: userService.linkToGetHobbies(id),
			},
			status: 201,
		})
	} catch (error) {
		return setResponse(res, { status: 400, data: { message: error.message } })
	}
}

export const deleteUserHobbies = (req, res, userId) => {
	try {
		let users = userService.getUsersWithoutHobbies()
		const id = +userId
		const foundUser = users.find((user) => user.id === id)

		if (!foundUser) {
			return setResponse(res, {
				data: { message: 'User not found' },
				status: 400,
			})
		}
		const updatedUser = userService.deleteUserHobbies(id, req.body.hobbies)

		return setResponse(res, {
			status: 200,
			data: { message: 'Hobby(ies) successfully deleted', user: updatedUser },
		})
	} catch (error) {
		return setResponse(res, { status: 400, data: { message: error.message } })
	}
}
