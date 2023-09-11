const { execSync } = require('child_process')
const fileSystem = require('fs')
const operatingSystem = require('os')
const currentPlatform = operatingSystem.platform()

const winProcessor = require('./winProcessor')
const unixProcessor = require('./unixProcessor')
const config = require('./config')

const isCurrentPlatformWindows = currentPlatform === 'win32'

const getProcessInfoViaPowerShell = () => {
	const command = isCurrentPlatformWindows
		? winProcessor.command
		: unixProcessor.command

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
	const timestamp = new Date().toISOString()
	const logMessage = `${timestamp}: ${processInfo}\n`

	fileSystem.appendFile('activityMonitor.log', logMessage, (err) => {
		if (err) {
			console.error('Oh no! ', err)
		}
	})
}

setInterval(displayProcessInfo, config.DISPLAY_INTERVAL)
setInterval(logProcessInfoToFile, config.LOG_INTERVAL)
