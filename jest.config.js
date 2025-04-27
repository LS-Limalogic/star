/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Use jsdom for DOM environment simulation
  // Optional: Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  // Optional: Setup files to run before test files
  // setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    // Handle module paths, especially if you have aliases or non-relative paths
    // Example: Map paths defined in tsconfig.json if you use them
    // '@/(.*)': '<rootDir>/src/$1',
    // Handle .js extensions in imports (important for ES Modules compatibility)
    '^(\.{1,2}/.*)\.js$': '$1',
  },
  // Define file extensions Jest should look for
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Transform settings for ts-jest
  transform: {
    '^.+\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        // Use ESM mode for compatibility with Vite/modern setups
        useESM: true,
      },
    ],
  },
  // Tell Jest to look for tests in .ts and .tsx files
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
}; 