/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Handle CSS imports (if any in components being tested)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(gif|ttf|eot|svg|png|webp)$': '<rootDir>/__mocks__/fileMock.js',
    // Alias for src paths
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'], // if you have a setupTests.js
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json', // ensure this points to your TS config
    }],
  },
  // Ignore transform patterns for node_modules except for specific ES modules if needed
  transformIgnorePatterns: [
    '/node_modules/(?!(@dnd-kit)/)', // Example: if @dnd-kit needs transpiling
  ],
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "text", "clover"],
  coverageDirectory: "coverage",
};
