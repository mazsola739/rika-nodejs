/**
 * End-to-end tests against the real Nager.Date API. They need the internet, so they only run with
 * `bun run test:e2e` (E2E=1); the normal test run and the CI skip them.
 */
import { describe, expect, it } from 'bun:test'
import { createHolidayService, PUBLIC_HOLIDAYS_API_URL } from './holidays.ts'

const COUNTRY = 'NL'
const INVALID_COUNTRY = 'AA'
const YEAR = new Date().getFullYear()

const get = (path: string) => fetch(`${PUBLIC_HOLIDAYS_API_URL}${path}`)

describe.skipIf(!process.env.E2E)('Nager.Date API (live)', () => {
  describe('the holiday service', () => {
    const service = createHolidayService()

    it('lists this year’s public holidays', async () => {
      const [first] = await service.getListOfPublicHolidays(YEAR, COUNTRY)
      expect(first).toEqual({
        name: expect.any(String),
        localName: expect.any(String),
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      })
    })

    it('answers whether today is a public holiday', async () => {
      expect(typeof (await service.checkIfTodayIsPublicHoliday(COUNTRY))).toBe('boolean')
    })

    it('lists the upcoming public holidays', async () => {
      expect((await service.getNextPublicHolidays(COUNTRY)).length).toBeGreaterThan(0)
    })
  })

  describe('/CountryInfo', () => {
    it('returns the country', async () => {
      const response = await get(`/CountryInfo/${COUNTRY}`)
      expect(response.status).toBe(200)
      expect(await response.json()).toMatchObject({
        commonName: 'Netherlands',
        countryCode: COUNTRY,
        borders: expect.any(Array),
      })
    })

    it('returns 404 for an unknown country', async () => {
      expect((await get(`/CountryInfo/${INVALID_COUNTRY}`)).status).toBe(404)
    })
  })

  describe('/LongWeekend', () => {
    it('returns the long weekends of the year', async () => {
      const response = await get(`/LongWeekend/${YEAR}/${COUNTRY}`)
      const [first] = (await response.json()) as unknown[]
      expect(response.status).toBe(200)
      expect(first).toMatchObject({
        startDate: expect.any(String),
        endDate: expect.any(String),
        dayCount: expect.any(Number),
        needBridgeDay: expect.any(Boolean),
      })
    })

    it('returns 404 for an unknown country', async () => {
      expect((await get(`/LongWeekend/${YEAR}/${INVALID_COUNTRY}`)).status).toBe(404)
    })
  })

  describe('/IsTodayPublicHoliday', () => {
    it('answers 200 or 204', async () => {
      expect([200, 204]).toContain((await get(`/IsTodayPublicHoliday/${COUNTRY}`)).status)
    })

    // In 2023 an invalid ?offset= gave 400; the API ignores it now, so this checks the country.
    it('answers 404 for an unknown country', async () => {
      expect((await get(`/IsTodayPublicHoliday/${INVALID_COUNTRY}`)).status).toBe(404)
    })
  })
})
