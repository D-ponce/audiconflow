export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  testMatch: [
    '<rootDir>/**/__tests__/**/*.js',
    '<rootDir>/**/*.{test,spec}.js'
  ],
  collectCoverageFrom: [
    '**/*.js',
    '!node_modules/**',
    '!coverage/**',
    '!jest.config.js',
    '!babel.config.js'
  ],
  moduleFileExtensions: ['js', 'json'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  verbose: true
};
