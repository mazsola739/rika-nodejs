/**
 * Module 4 – the holiday service from the terminal.
 * Run: bun run module-4 NL (or GB, FR, DE).
 */
import { createHolidayService, SUPPORTED_COUNTRIES } from './holidays.ts'

const country = (process.argv[2] ?? 'NL').toUpperCase()
const service = createHolidayService()

try {
  const [isHoliday, next] = await Promise.all([
    service.checkIfTodayIsPublicHoliday(country),
    service.getNextPublicHolidays(country),
  ])

  console.log(`Is today a public holiday in ${country}? ${isHoliday ? 'Yes 🎉' : 'No'}`)
  console.log('The next public holidays:')
  for (const holiday of next) {
    console.log(`  ${holiday.date}  ${holiday.name} (${holiday.localName})`)
  }
} catch (error) {
  console.error((error as Error).message)
  console.error(`Supported countries: ${SUPPORTED_COUNTRIES.join(', ')}`)
  process.exitCode = 1
}
