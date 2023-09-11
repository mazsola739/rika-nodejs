const parseProcessInfo = (output) => {
	const [cpu, memory, task] = output.trim().split(/\s+/)

	return {
		task,
		cpu,
		memory,
	}
}

const command = 'ps -A -o %cpu,%mem,comm | sort -nr | head -n 1'

module.exports = {
	parseProcessInfo,
	command,
}
