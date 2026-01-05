module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)', '**/*.test.(ts|tsx)'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        module: 'esnext',
        target: 'es2017',
        lib: ['dom', 'dom.iterable', 'esnext'],
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
      useESM: true,
    }],
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/storybook-static/**',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@app/(.*)$': '<rootDir>/app/$1',
    '^@features/(.*)$': '<rootDir>/features/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^server-only$': '<rootDir>/shared/mocks/framework/server-only.js',
    '^client-only$': '<rootDir>/shared/mocks/framework/client-only.js',
    '^next/navigation$': '<rootDir>/shared/mocks/framework/next/navigation.js',
    '^next/headers$': '<rootDir>/shared/mocks/framework/next/headers.js',
    '^next-intl$': '<rootDir>/shared/mocks/framework/next-intl.js',
    '^@niledatabase/(.*)$': '<rootDir>/shared/mocks/framework/nile-database.js',
    // Legacy mappings for backward compatibility during migration
    '^@niledatabase/client$': '<rootDir>/shared/mocks/framework/nile-database.js',
    '^@niledatabase/react$': '<rootDir>/shared/mocks/framework/nile-database.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/storybook-static/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(next-intl|use-intl|@niledatabase|class-variance-authority|next-intl\\/routing)/)',
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};
