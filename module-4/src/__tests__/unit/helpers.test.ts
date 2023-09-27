import { SUPPORTED_COUNTRIES } from '../../config'
import { shortenPublicHoliday, validateInput } from '../../helpers'
import { PublicHoliday, PublicHolidayShort } from '../../types'

const TEST_HOLIDAY: PublicHoliday = {
	date: '2023-12-24',
	localName: 'Karácsony',
	name: 'Christmas',
	countryCode: '',
	fixed: true,
	global: true,
	counties: [],
	launchYear: 0,
	types: [],
}
const SHORT_TEST_HOLIDAY: PublicHolidayShort = {
	date: TEST_HOLIDAY.date,
	localName: TEST_HOLIDAY.localName,
	name: TEST_HOLIDAY.name,
}

describe('validateInput', () => {
	const validYear = new Date().getFullYear()

	it('should return true for a valid country and year', () => {
		const result = validateInput({
			country: SUPPORTED_COUNTRIES[0],
			year: validYear,
		})

		expect(result).toBe(true)
	})

	it('should return true for a valid country when no year is provided', () => {
		const result = validateInput({ country: SUPPORTED_COUNTRIES[2] })

		expect(result).toBe(true)
	})

	it('should return true for a valid year when no country is provided', () => {
		const result = validateInput({ year: validYear })

		expect(result).toBe(true)
	})

	it('should throw error if country is not supported', () => {
		const invalidCountry = 'HU'

		expect(() => validateInput({ country: invalidCountry })).toThrow(
			new Error(
				`Country provided is not supported, received: ${invalidCountry}`
			)
		)
	})

	it('should throw an error for invalid year', () => {
		const invalidYear = 2000

		expect(() => validateInput({ year: invalidYear })).toThrow(
			new Error(`Year provided not the current, received: ${invalidYear}`)
		)
	})
})

describe('shortenPublicHoliday', () => {
	it('should shorten a public holiday object', () => {
		expect(shortenPublicHoliday(TEST_HOLIDAY)).toStrictEqual(SHORT_TEST_HOLIDAY)
	})
})
