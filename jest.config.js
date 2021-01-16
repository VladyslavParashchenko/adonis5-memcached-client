module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	verbose: false,
	testMatch: ['**/*.spec.ts'],
	testPathIgnorePatterns: ['build'],
	globals: {
		'ts-jest': {
			astTransformers: {
				before: [
					{
						path: './adonisTsTransformers.js',
						options: {},
					},
				],
			},
		},
	},
}
