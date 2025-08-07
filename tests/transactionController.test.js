// tests/transactionsController.test.js
import request from 'supertest';
import { jest } from '@jest/globals';

// Step 1: Mock db before importing app
const mockQuery = jest.fn();
jest.unstable_mockModule('../models/db.js', () => ({
  default: { query: mockQuery }
}));

// Step 2: Import app AFTER mocks are set
const app = (await import('../app.js')).default;

describe('Transactions Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all transactions', async () => {
    const mockData = [{ transaction_id: 1, ticker: 'AAPL', quantity: 10 }];
    mockQuery.mockResolvedValue([mockData]);

    const res = await request(app).get('/transactions');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  it('should handle DB error', async () => {
    mockQuery.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/transactions');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'DB error' });
  });
});
