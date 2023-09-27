import {
	checkIfTodayIsPublicHoliday,
	getListOfPublicHolidays,
	getNextPublicHolidays,
} from '../../services/public-holidays.service'

const current_year = new Date().getFullYear()
const supported_country = 'GB'

describe('Integration tests', () => {
	describe('getListOfPublicHolidays', () => {
		it('should get a list of public holidays for the current year', async () => {
			const [holidays] = await getListOfPublicHolidays(
				current_year,
				supported_country
			)

			expect(holidays).toEqual({
				name: expect.any(String),
				localName: expect.any(String),
				date: expect.any(String),
			})

			expect(Object.entries(holidays).length).toBe(3)
		})

		it("should throw error if year doesn't equal to the current year", async () => {
			const year = 2022

			await expect(
				getListOfPublicHolidays(year, supported_country)
			).rejects.toThrow(
				new Error(`Year provided not the current, received: ${year}`)
			)
		})
	})

	describe('checkIfTodayIsPublicHoliday', () => {
		it('should return a boolean based on the API response', async () => {
			const isTodayPublicHoliday = await checkIfTodayIsPublicHoliday(
				supported_country
			)

			expect(typeof isTodayPublicHoliday).toBe('boolean')
		})

		it('should throw error if country is not supported', async () => {
			const country = 'HU'

			await expect(checkIfTodayIsPublicHoliday(country)).rejects.toThrow(
				new Error(`Country provided is not supported, received: ${country}`)
			)
		})
	})

	describe('getNextPublicHolidays', () => {
		it('should return a list of the upcoming public holidays', async () => {
			const [nextHolidays] = await getNextPublicHolidays(supported_country)

			expect(nextHolidays).toEqual({
				date: expect.any(String),
				name: expect.any(String),
				localName: expect.any(String),
			})
		})

		it('should throw error if country is not supported', async () => {
			const country = 'HU'

			await expect(getNextPublicHolidays(country)).rejects.toThrow(
				new Error(`Country provided is not supported, received: ${country}`)
			)
		})
	})
})
