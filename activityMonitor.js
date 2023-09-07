const { execSync } = require('child_process')
const fileSystem = require('fs')
const operatingSystem = require('os')
const currentPlatform = operatingSystem.platform()

const winProcessor = require('./winProcessor')
const unixProcessor = require('./unixProcessor')

const isCurrentPlatformWindows = currentPlatform === 'win32'

const getProcessInfoViaPowerShell = () => {
	const command = isCurrentPlatformWindows
		? winProcessor.getCommand
		: unixProcessor.getCommand

	return execSync(command).toString()
}

const getProcessInfo = () => {
	const processInfo = getProcessInfoViaPowerShell()
	if (!processInfo) return 'No processes found.'

	const { task, cpu, memory } = isCurrentPlatformWindows
		? winProcessor.parseProcessInfo(processInfo)
		: unixProcessor.parseProcessInfo(processInfo)

	return `Most CPU-intensive (visible) process: ${task} | CPU: ${cpu}% | Memory: ${memory} MB`
}

const displayProcessInfo = () => {
	const processInfo = getProcessInfo()

	process.stdout.write('\r')
	process.stdout.write(processInfo)
}

const logProcessInfoToFile = () => {
	const processInfo = getProcessInfo()
	const currentTimestamp = Math.floor(Date.now() / 1000)

	const logEntryWithTimestamp = `${currentTimestamp} : ${processInfo}\n`

	fileSystem.appendFile('activityMonitor.log', logEntryWithTimestamp, (err) => {
		if (err) {
			console.error('Oh no! ', err)
		}
	})
}

setInterval(displayProcessInfo, 100)
setInterval(logProcessInfoToFile, 60000)
