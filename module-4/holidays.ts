/**
 * Module 4 – testing: a small service around the Nager.Date public holidays API
 * (https://date.nager.at). Plain fetch, so it runs in Node, Bun and the browser.
 */

export const PUBLIC_HOLIDAYS_API_URL = 'https://date.nager.at/api/v3'

export const SUPPORTED_COUNTRIES = ['GB', 'FR', 'DE', 'NL'] as const
export type Country = (typeof SUPPORTED_COUNTRIES)[number]

export type PublicHoliday = {
  date: string
  localName: string
  name: string
  countryCode: string
  fixed: boolean
  global: boolean
  counties: string[] | null
  launchYear: number | null
  types: string[]
}

export type PublicHolidayShort = Pick<PublicHoliday, 'name' | 'localName' | 'date'>

const isSupportedCountry = (country: string): country is Country =>
  (SUPPORTED_COUNTRIES as readonly string[]).includes(country)

/** The rules of the task: only the supported countries, and only the current year. */
export const validateInput = (
  { year, country }: { year?: number; country?: string },
  today = new Date(),
) => {
  if (country !== undefined && !isSupportedCountry(country)) {
    throw new Error(`Country provided is not supported, received: ${country}`)
  }
  if (year !== undefined && year !== today.getFullYear()) {
    throw new Error(`Year provided not the current, received: ${year}`)
  }
  return true
}

export const shortenPublicHoliday = ({
  name,
  localName,
  date,
}: PublicHoliday): PublicHolidayShort => ({
  name,
  localName,
  date,
})

export type FetchFn = (url: string) => Promise<Response>

/**
 * The service. `fetchFn` can be swapped in the tests; in the app it is the global fetch.
 * Invalid input throws; a failing API gives an empty list (or `false`), as in the original task.
 */
export const createHolidayService = (fetchFn: FetchFn = (url) => fetch(url)) => {
  const getJson = async <T>(path: string): Promise<T> => {
    const response = await fetchFn(`${PUBLIC_HOLIDAYS_API_URL}${path}`)
    if (!response.ok) throw new Error(`Nager.Date answered ${response.status}`)
    return response.json() as Promise<T>
  }

  return {
    async getListOfPublicHolidays(year: number, country: string): Promise<PublicHolidayShort[]> {
      validateInput({ year, country })
      try {
        const holidays = await getJson<PublicHoliday[]>(`/PublicHolidays/${year}/${country}`)
        return holidays.map(shortenPublicHoliday)
      } catch {
        return []
      }
    },

    /** The API answers 200 when today is a public holiday and 204 when it is not. */
    async checkIfTodayIsPublicHoliday(country: string): Promise<boolean> {
      validateInput({ country })
      try {
        const { status } = await fetchFn(
          `${PUBLIC_HOLIDAYS_API_URL}/IsTodayPublicHoliday/${country}`,
        )
        return status === 200
      } catch {
        return false
      }
    },

    async getNextPublicHolidays(country: string): Promise<PublicHolidayShort[]> {
      validateInput({ country })
      try {
        const holidays = await getJson<PublicHoliday[]>(`/NextPublicHolidays/${country}`)
        return holidays.map(shortenPublicHoliday)
      } catch {
        return []
      }
    },
  }
}

export type HolidayService = ReturnType<typeof createHolidayService>
