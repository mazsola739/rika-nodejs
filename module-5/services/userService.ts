import * as userRepository from '../repositories/userRepository'
import { UserWithHobbies } from '../types'

export const getUsersWithoutHobbies = () =>
	userRepository.getUsersWithoutHobbies()

export const getUsersWithHobbies = () => userRepository.getUsersWithHobbies()

export const getUserWithoutHobbies = (id: number) =>
	userRepository.getUserWithoutHobbies(id)

export const getUserWithHobbies = (id: number) =>
	userRepository.getUserWithHobbies(id)

export const createUser = (data: Partial<UserWithHobbies>) =>
	userRepository.createUser(data)

export const updateUser = (id: number, data: Partial<UserWithHobbies>) =>
	userRepository.updateUser(id, data)

export const deleteUser = (id: number) => userRepository.deleteUser(id)

export const getListOfUserHobbies = (id: number) =>
	userRepository.getUserHobbies(id)

export const updateUserHobbies = (id: number, hobbies: string[]) =>
	userRepository.updateUserHobbies(id, hobbies)

export const deleteUserHobbies = (id: number, hobbies: string[]) =>
	userRepository.deleteUserHobbies(id, hobbies)

export const linkToGetHobbies = (id: number) =>
	userRepository.linkToGetHobbies(id)
