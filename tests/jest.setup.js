import { jest } from '@jest/globals';

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterAll(async () => {
    await new Promise(resolve => setImmediate(resolve));
  });