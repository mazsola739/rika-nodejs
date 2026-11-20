import { describe, expect, it, mock } from 'bun:test'
import {
  createHolidayService,
  PUBLIC_HOLIDAYS_API_URL,
  type PublicHoliday,
  shortenPublicHoliday,
  validateInput,
} from './holidays.ts'

const YEAR = new Date().getFullYear()

const CHRISTMAS: PublicHoliday = {
  date: `${YEAR}-12-25`,
  localName: 'Eerste Kerstdag',
  name: 'Christmas Day',
  countryCode: 'NL',
  fixed: false,
  global: true,
  counties: null,
  launchYear: null,
  types: ['Public'],
}
const SHORT_CHRISTMAS = {
  name: 'Christmas Day',
  localName: 'Eerste Kerstdag',
  date: `${YEAR}-12-25`,
}

/** A fetch that answers every request with the given response, and records the URLs. */
const fakeFetch = (respond: () => Response | Promise<Response>) => {
  const fn = mock(async (_url: string) => respond())
  return { fn, service: createHolidayService(fn) }
}

describe('validateInput', () => {
  it('accepts a supported country and the current year', () => {
    expect(validateInput({ country: 'GB', year: YEAR })).toBe(true)
    expect(validateInput({ country: 'DE' })).toBe(true)
    expect(validateInput({ year: YEAR })).toBe(true)
  })

  it('rejects an unsupported country', () => {
    expect(() => validateInput({ country: 'HU' })).toThrow(
      'Country provided is not supported, received: HU',
    )
  })

  it('rejects any other year', () => {
    expect(() => validateInput({ year: 2000 })).toThrow(
      'Year provided not the current, received: 2000',
    )
    expect(() => validateInput({ year: 2023 }, new Date('2023-06-01'))).not.toThrow()
  })
})

describe('shortenPublicHoliday', () => {
  it('keeps only the name, the local name and the date', () => {
    expect(shortenPublicHoliday(CHRISTMAS)).toStrictEqual(SHORT_CHRISTMAS)
  })
})

describe('holiday service', () => {
  it('lists the public holidays of the year, shortened', async () => {
    const { fn, service } = fakeFetch(() => Response.json([CHRISTMAS]))

    expect(await service.getListOfPublicHolidays(YEAR, 'NL')).toEqual([SHORT_CHRISTMAS])
    expect(fn).toHaveBeenCalledWith(`${PUBLIC_HOLIDAYS_API_URL}/PublicHolidays/${YEAR}/NL`)
  })

  it('lists the next public holidays', async () => {
    const { fn, service } = fakeFetch(() => Response.json([CHRISTMAS, CHRISTMAS]))

    expect(await service.getNextPublicHolidays('FR')).toHaveLength(2)
    expect(fn).toHaveBeenCalledWith(`${PUBLIC_HOLIDAYS_API_URL}/NextPublicHolidays/FR`)
  })

  it('tells from the status code whether today is a public holiday', async () => {
    expect(
      await fakeFetch(
        () => new Response(null, { status: 200 }),
      ).service.checkIfTodayIsPublicHoliday('GB'),
    ).toBe(true)
    expect(
      await fakeFetch(
        () => new Response(null, { status: 204 }),
      ).service.checkIfTodayIsPublicHoliday('GB'),
    ).toBe(false)
  })

  it('gives an empty list or false when the API fails', async () => {
    const { service } = fakeFetch(() => new Response('oops', { status: 500 }))
    expect(await service.getListOfPublicHolidays(YEAR, 'DE')).toEqual([])
    expect(await service.getNextPublicHolidays('DE')).toEqual([])

    const offline = fakeFetch(() => Promise.reject(new TypeError('fetch failed'))).service
    expect(await offline.checkIfTodayIsPublicHoliday('DE')).toBe(false)
    expect(await offline.getNextPublicHolidays('DE')).toEqual([])
  })

  it('throws for invalid input before calling the API', async () => {
    const { fn, service } = fakeFetch(() => Response.json([]))

    await expect(service.getListOfPublicHolidays(2022, 'GB')).rejects.toThrow('received: 2022')
    await expect(service.checkIfTodayIsPublicHoliday('HU')).rejects.toThrow('received: HU')
    await expect(service.getNextPublicHolidays('HU')).rejects.toThrow('received: HU')
    expect(fn).not.toHaveBeenCalled()
  })
})
