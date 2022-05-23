import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
  return {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverage: true,
    collectCoverageFrom: [
      'lib/**/*.ts',
      '!lib/index.ts',
      '!lib/mailer.constants.ts',
      '!lib/mailer.interface.ts',
    ],
    coverageDirectory: './coverage',
    testEnvironment: 'node',
  };
};
