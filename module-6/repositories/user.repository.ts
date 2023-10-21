import { UserEntity } from '../entities/user.entity'
import users from '../db/users.json'

const getUsers = (): UserEntity[] => {
	try {
		return users
	} catch (error) {
		console.error(`Error reading users data: ${error}`)

		return []
	}
}

const getUserById = (id: string): UserEntity => {
	const userList: UserEntity[] = getUsers()

	return userList.find((user) => user.id === id)
}

export const userRepository = { getUsers, getUserById }
