import axios from 'axios'
import {
	checkIfTodayIsPublicHoliday,
	getListOfPublicHolidays,
	getNextPublicHolidays,
} from '../../services/public-holidays.service'
import { PUBLIC_HOLIDAYS_API_URL } from '../../config'
import { PublicHoliday, PublicHolidayShort } from '../../types'

const TEST_HOLIDAYS: Array<PublicHoliday> = [
	{
		date: '2023-12-24',
		localName: 'Karácsony',
		name: 'Christmas',
		countryCode: '',
		fixed: true,
		global: true,
		counties: [],
		launchYear: 0,
		types: [],
	},
]

const SHORT_TEST_HOLIDAYS: Array<PublicHolidayShort> = [
	{
		date: TEST_HOLIDAYS[0].date,
		localName: TEST_HOLIDAYS[0].localName,
		name: TEST_HOLIDAYS[0].name,
	},
]

const year = new Date().getFullYear()
const country = 'GB'

afterEach(() => {
	jest.restoreAllMocks()
})

describe('getListOfPublicHolidays', () => {
	it('should return a list of public holidays', async () => {
		jest
			.spyOn(axios, 'get')
			.mockImplementation(() => Promise.resolve({ data: TEST_HOLIDAYS }))

		const holidays = await getListOfPublicHolidays(year, country)

		expect(holidays).toEqual(SHORT_TEST_HOLIDAYS)
	})

	it('should call API with correct parameters', async () => {
		const mockGetSpy = jest
			.spyOn(axios, 'get')
			.mockImplementation(() => Promise.resolve({ data: TEST_HOLIDAYS }))

		await getListOfPublicHolidays(year, country)

		expect(mockGetSpy).toHaveBeenCalledWith(
			`${PUBLIC_HOLIDAYS_API_URL}/PublicHolidays/${year}/${country}`
		)
	})

	it('should return empty array if there is an error with the request', async () => {
		jest.spyOn(axios, 'get').mockRejectedValue(() => Promise.reject())

		const holidays = await getListOfPublicHolidays(year, country)

		expect(holidays).toEqual([])
	})
})

describe('checkIfTodayIsPublicHoliday', () => {
	it('should return true when the API responds with status 200', async () => {
		jest
			.spyOn(axios, 'get')
			.mockImplementation(() => Promise.resolve({ status: 200 }))

		const isTodayPublicHoliday = await checkIfTodayIsPublicHoliday(country)

		expect(isTodayPublicHoliday).toBe(true)
	})

	it('should return false when the API responds with status 204', async () => {
		jest
			.spyOn(axios, 'get')
			.mockImplementation(() => Promise.resolve({ status: 204 }))

		const isTodayPublicHoliday = await checkIfTodayIsPublicHoliday(country)

		expect(isTodayPublicHoliday).toBe(false)
	})

	it('should call API with correct parameters', async () => {
		const mockGetSpy = jest
			.spyOn(axios, 'get')
			.mockImplementation(() => Promise.resolve({ status: 200 }))

		await checkIfTodayIsPublicHoliday(country)

		expect(mockGetSpy).toHaveBeenCalledWith(
			`${PUBLIC_HOLIDAYS_API_URL}/IsTodayPublicHoliday/${country}`
		)
	})

	it('should return false when there is a request error', async () => {
		jest.spyOn(axios, 'get').mockRejectedValue(() => Promise.reject())

		const isTodayPublicHoliday = await checkIfTodayIsPublicHoliday(country)

		expect(isTodayPublicHoliday).toBe(false)
	})
})

describe('getNextPublicHolidays', () => {
	it('should return a list of transformed public holiday objects', async () => {
		jest
			.spyOn(axios, 'get')
			.mockImplementation(() => Promise.resolve({ data: TEST_HOLIDAYS }))

		const nextHolidays = await getNextPublicHolidays(country)

		expect(nextHolidays).toEqual(SHORT_TEST_HOLIDAYS)
	})

	it('should call API with correct parameters', async () => {
		const mockGetSpy = jest
			.spyOn(axios, 'get')
			.mockImplementation(() => Promise.resolve({ data: TEST_HOLIDAYS }))

		await getNextPublicHolidays(country)

		expect(mockGetSpy).toHaveBeenCalledWith(
			`${PUBLIC_HOLIDAYS_API_URL}/NextPublicHolidays/${country}`
		)
	})

	it('should return empty array if there is an error with the request', async () => {
		jest.spyOn(axios, 'get').mockRejectedValue(() => Promise.reject())

		const nextHolidays = await getNextPublicHolidays(country)

		expect(nextHolidays).toEqual([])
	})
})
