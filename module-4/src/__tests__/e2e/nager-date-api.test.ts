import { PUBLIC_HOLIDAYS_API_URL } from '../../config'

const request = require('supertest')

const TEST_COUNTRY = 'HU'
const TEST_COUNTRY_INVALID = 'AA'
const OK = 200
const NO_CONTENT = 204
const NOT_FOUND = 404
const INTERNAL_SERVER_ERROR = 500
const year = new Date().getFullYear()

describe('Nager.Date API', () => {
	describe('/CountryInfo', () => {
		it('should return 200 and information about country', async () => {
			const { status, body } = await request(PUBLIC_HOLIDAYS_API_URL).get(
				`/CountryInfo/${TEST_COUNTRY}`
			)

			expect(status).toEqual(OK)
			expect(body).toEqual({
				commonName: expect.any(String),
				officialName: expect.any(String),
				countryCode: expect.any(String),
				region: expect.any(String),
				borders: expect.any(Array),
			})
		})

		it('should return 404 not found for invalid country code', async () => {
			const {
				status,
				body: { title },
			} = await request(PUBLIC_HOLIDAYS_API_URL).get(
				`/CountryInfo/${TEST_COUNTRY_INVALID}`
			)

			expect(status).toEqual(NOT_FOUND)
			expect(title).toEqual('Not Found')
		})
	})

	describe('/LongWeekend', () => {
		it('should return 200 and a list of long weekends', async () => {
			const { body, status } = await request(PUBLIC_HOLIDAYS_API_URL).get(
				`/LongWeekend/${year}/${TEST_COUNTRY}`
			)
			const [sampleData] = body

			expect(status).toBe(OK)
			expect(sampleData).toEqual({
				dayCount: expect.any(Number),
				startDate: expect.any(String),
				endDate: expect.any(String),
				needBridgeDay: expect.any(Boolean),
			})
		})

		it('should return 404 not found for invalid country code', async () => {
			const {
				status,
				body: { title },
			} = await request(PUBLIC_HOLIDAYS_API_URL).get(
				`/LongWeekend/${year}/${TEST_COUNTRY_INVALID}`
			)

			expect(status).toEqual(NOT_FOUND)
			expect(title).toEqual('Not Found')
		})
	})

	describe('/IsTodayPublicHoliday', () => {
		it('should return status 200 or 204 to indicate whether today is a public holiday', async () => {
			const { status } = await request(PUBLIC_HOLIDAYS_API_URL).get(
				`/IsTodayPublicHoliday/${TEST_COUNTRY}`
			)

			expect(status).toBeGreaterThanOrEqual(OK)
			expect(status).toBeLessThanOrEqual(NO_CONTENT)
		})

		it('should return status 400 when there is a validation error', async () => {
			const invalidOffset = 'test'
			const {
				status,
				body: { title, errors },
			} = await request(PUBLIC_HOLIDAYS_API_URL).get(
				`/IsTodayPublicHoliday/${TEST_COUNTRY}?offset=${invalidOffset}`
			)

			expect(status).toEqual(400)
			expect(title).toEqual('One or more validation errors occurred.')
			expect(errors.offset).toEqual([
				`The value '${invalidOffset}' is not valid.`,
			])
		})

		it('should return 404 not found for invalid country code', async () => {
			const {
				status,
				body: { title },
			} = await request(PUBLIC_HOLIDAYS_API_URL).get(
				`/IsTodayPublicHoliday/${TEST_COUNTRY_INVALID}`
			)

			expect(status).toEqual(NOT_FOUND)
			expect(title).toEqual('Not Found')
		})
	})

	describe('/NextPublicHolidays', () => {
		it('should return 200 and next public holidays for the country', async () => {
			const { status, body } = await request(PUBLIC_HOLIDAYS_API_URL).get(
				`/NextPublicHolidays/${TEST_COUNTRY}`
			)

			expect(status).toEqual(OK)
			expect(body).not.toHaveLength(0)
		})

		it('should return 500 if country does not exist', async () => {
			const { status } = await request(PUBLIC_HOLIDAYS_API_URL).get(
				`/NextPublicHolidays/${TEST_COUNTRY_INVALID}`
			)

			expect(status).toEqual(INTERNAL_SERVER_ERROR)
		})
	})
})
