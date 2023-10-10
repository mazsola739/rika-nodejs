import * as fs from 'fs'
import * as path from 'path'
import { UserWithHobbies, UserWithoutHobbies } from '../types'
import dbMock from '../db/dbMock.json'

let users = dbMock

const dbFilePath = path.resolve(process.cwd(), 'module-5/db/dbMock.json')

const writeDataToDbMock = (data) => {
	return fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2))
}

export const getUsersWithoutHobbies = (): UserWithoutHobbies[] =>
	users.map(({ hobbies, ...rest }) => rest)

export const getUsersWithHobbies = (): UserWithHobbies[] => users

export const getUserWithoutHobbies = (
	id: number
): UserWithoutHobbies | undefined =>
	getUsersWithoutHobbies().find((user) => user.id === id)

export const getUserWithHobbies = (id: number): UserWithHobbies =>
	users.find((user) => user.id === id)

export const createUser = (
	data: Partial<UserWithHobbies>
): UserWithHobbies[] => {
	const userData = {
		id: users.length + 1,
		name: data.name || '',
		email: data.email || '',
		hobbies: data.hobbies || [],
	}

	users.push(userData)
	writeDataToDbMock(users)

	return users
}

export const updateUser = (
	id: number,
	data: Partial<UserWithHobbies>
): UserWithHobbies => {
	users = users.map((user) => {
		if (user.id === id) {
			return { ...user, ...data }
		}
		return user
	})

	writeDataToDbMock(users)

	return getUserWithHobbies(id)
}

export const deleteUser = (id: number) => {
	users = users.filter((user) => user.id !== id)

	writeDataToDbMock(users)

	return users
}

export const getUserHobbies = (id: number): string[] | undefined =>
	getUserWithHobbies(id)?.hobbies

export const updateUserHobbies = (id: number, hobbies: string[]) => {
	const user: UserWithHobbies | undefined = getUserWithHobbies(id)
	const updatedHobbies = [...new Set([...user.hobbies, ...hobbies])]

	return updateUser(id, { hobbies: updatedHobbies })
}

export const deleteUserHobbies = (
	id: number,
	hobbiesToDelete: string[]
): UserWithHobbies => {
	const hobbies = getUserWithHobbies(id)?.hobbies

	const updatedHobbies = hobbies.filter(
		(hobby) => !hobbiesToDelete.includes(hobby)
	)

	return updateUser(id, { hobbies: updatedHobbies })
}

export const linkToGetHobbies = (id: number) => [
	{
		self: {
			href: `http://localhost:3000/users/${id}/hobbies`,
		},
	},
]
