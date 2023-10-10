export type UserWithHobbies = {
	id: number
	name: string
	email: string
	hobbies?: string[]
}

export type UserWithoutHobbies = Omit<UserWithHobbies, 'hobbies'>
