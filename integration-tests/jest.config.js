export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/setup/setupTests.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  testTimeout: 30000, // 30 segundos para pruebas de integración
  collectCoverageFrom: [
    'tests/**/*.js',
    '!tests/setup/**'
  ],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true
};
