import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
  return {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'lib',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
  };
};
