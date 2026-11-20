/**
 * Module 1 – Node.js introduction: a REPL with a custom `.random` command.
 * Run: bun run module-1, then type `.random 1 100` or `.help`.
 */
import repl from 'node:repl'
import { describeRandom, HELP, random } from './random.ts'

console.log(HELP)

const server = repl.start('> ')

server.defineCommand('random', {
  help: HELP,
  action(input) {
    this.clearBufferedCommand()
    console.log(describeRandom(random(input)))
    this.displayPrompt()
  },
})
