const parseProcessInfo = (output) => {
	const [cpu, memory, task] = output.trim().split(/\s+/)

	return {
		task,
		cpu,
		memory,
	}
}

const getCommand = 'ps -A -o %cpu,%mem,comm | sort -nr | head -n 1'

module.exports = {
	parseProcessInfo,
	getCommand,
}
