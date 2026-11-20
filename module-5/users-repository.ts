import seed from './users.json'

export type User = {
  id: number
  name: string
  email: string
  hobbies: string[]
}

export type UserFields = Pick<User, 'name' | 'email'>

/** In-memory users. Every repository starts from its own copy of the seed data. */
export const createUsersRepository = (initial: User[] = seed) => {
  const users: User[] = structuredClone(initial)

  const find = (id: number) => users.find((user) => user.id === id)

  return {
    list: (): User[] => users,
    find,
    findByEmail: (email: string) =>
      users.find((user) => user.email.toLowerCase() === email.toLowerCase()),

    create(fields: UserFields, hobbies: string[] = []): User {
      // The next id is one above the highest, so a deleted user's id is never given out twice.
      const id = Math.max(0, ...users.map((user) => user.id)) + 1
      const user = { id, ...fields, hobbies: unique(hobbies) }
      users.push(user)
      return user
    },

    update(id: number, fields: Partial<UserFields>): User | undefined {
      const user = find(id)
      if (user) Object.assign(user, fields)
      return user
    },

    remove(id: number): User | undefined {
      const index = users.findIndex((user) => user.id === id)
      return index === -1 ? undefined : users.splice(index, 1)[0]
    },

    addHobbies(id: number, hobbies: string[]): User | undefined {
      const user = find(id)
      if (user) user.hobbies = unique([...user.hobbies, ...hobbies])
      return user
    },

    removeHobby(id: number, hobby: string): User | undefined {
      const user = find(id)
      if (user) user.hobbies = user.hobbies.filter((item) => item !== hobby)
      return user
    },
  }
}

export type UsersRepository = ReturnType<typeof createUsersRepository>

const unique = (items: string[]) => [...new Set(items.map((item) => item.trim()).filter(Boolean))]
