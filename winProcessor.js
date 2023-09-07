const parseProcessInfo = (output) => {
	const [task, cpu, memory] = output.trim().split(/\s+/)

	return {
		task,
		cpu: parseFloat(cpu).toFixed(2),
		memory: parseFloat(Math.round(memory / (1024 * 1024))),
	}
}

const getCommand =
	'powershell "$process = Get-Process | Sort-Object CPU -Descending | Select-Object -First 1; ' +
	'$cpuUsage = [Math]::Min(($process.CPU / ([Environment]::ProcessorCount * 100)), 100); ' +
	"$process.ProcessName + ' ' + $cpuUsage + '% ' + $process.WorkingSet\""

module.exports = {
	parseProcessInfo,
	getCommand,
}
