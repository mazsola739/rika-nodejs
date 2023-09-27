module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	silent: false,
	verbose: true,
	collectCoverageFrom: ['<rootDir>/module-4/src/**'],
	coverageReporters: ['text', 'json', 'html'],
	coverageThreshold: {
		global: {
			lines: 90,
		},
	},
}
