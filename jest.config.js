const nextJest = require('next/jest')
const createJestConfig = nextJest({ dir: './' })

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text-summary'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/public/**',
    '!next.config.*',
    '!**/postcss.config.*',
    '!**/tailwind.config.*',
    "!src/**/__mocks__/**",
    "!src/**/types.ts",
    "!src/**/index.ts"
  ],
  testMatch: [
    '<rootDir>/**/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/**/?(*.)+(test).{ts,tsx}',
  ],
}

module.exports = async () => (await createJestConfig(customJestConfig)())
