import { User } from '../entities'

let users: User[] = []

const getUserById = (userId: string): User => {
	const user = users.find((user) => user.id === userId)

	return user
}

export const userRepository = { getUserById }
