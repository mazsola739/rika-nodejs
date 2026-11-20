/** Module 3 – WithTime: times an async call with events. Run: bun run module-3:time */
import { randomBetween } from '../module-1/random.ts'
import { fetchPost, type Post, WithTime } from './with-time.ts'

const withTime = new WithTime<Post>()

withTime.on('begin', () => console.log('About to execute'))
withTime.on('end', (ms) => console.log(`Done with execute in ${ms} ms`))
withTime.on('data', (post) => console.log(post))
withTime.on('error', (error) => console.error(`Failed: ${error.message}`))

await withTime.execute(fetchPost, randomBetween(1, 100)).catch(() => {
  process.exitCode = 1
})
