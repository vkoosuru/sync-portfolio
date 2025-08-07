// tests/holdingService.test.js
/**
 * @jest-environment node
 */
import { jest } from '@jest/globals';

jest.unstable_mockModule('../models/db.js', () => ({
  default: {
    getConnection: jest.fn(() => mockConnection)
  }
}));

jest.unstable_mockModule('../utils/priceFetcher.js', () => ({
  getHistoricalPrices: jest.fn(() => [
    208.0, 209.0, 207.0, 206.0, 205.0, 204.0, 203.0, 202.0, 201.0, 200.0
  ]),
  fetchCurrentPrice: jest.fn(() => 200.0)
}));

jest.unstable_mockModule('../models/queries.js', () => ({
  getHoldingsQuery: 'SELECT * FROM holdings',
  updateBalance: 'UPDATE balance SET amount = amount - ?',
  getHoldingByTicker: 'SELECT * FROM holdings WHERE ticker = ?',
  updateHoldingQuantity: 'UPDATE holdings SET quantity = ? WHERE ticker = ?',
  deleteHolding: 'DELETE FROM holdings WHERE ticker = ?',
  insertHolding: 'INSERT INTO holdings (ticker, quantity, buy_price) VALUES (?, ?, ?)',
  updateBalanceAdd: 'UPDATE balance SET amount = amount + ?'
}));

const mockConnection = {
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
  release: jest.fn(),
  query: jest.fn()
};

describe('holdingsService', () => {
  let getHoldings, buyStock, sellStock;

  beforeAll(async () => {
    const serviceModule = await import('../services/holdingsService.js');
    getHoldings = serviceModule.getHoldings;
    buyStock = serviceModule.buyStock;
    sellStock = serviceModule.sellStock;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get holdings', async () => {
    mockConnection.query.mockResolvedValueOnce([
      { ticker: 'AAPL', quantity: 10, buy_price: 100 }
    ]);

    const result = await getHoldings();
    expect(result).toEqual([
      {
        ticker: 'AAPL',
        quantity: 10,
        buy_price: 100,
        current_price: 200.0,
        pnl: '100.00%'
      }
    ]);
    expect(mockConnection.query).toHaveBeenCalled();
  });

  it('should buy stock', async () => {
    mockConnection.query.mockResolvedValueOnce([{ amount: 5000 }]); // balance
    mockConnection.query.mockResolvedValueOnce(); // update balance
    mockConnection.query.mockResolvedValueOnce(); // insert holding

    await buyStock('AAPL', 2, 100);
    expect(mockConnection.beginTransaction).toHaveBeenCalled();
    expect(mockConnection.commit).toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalled();
  });

  it('should sell stock', async () => {
    mockConnection.query.mockResolvedValueOnce([[{ quantity: 5 }]]); // get holding
    mockConnection.query.mockResolvedValueOnce(); // update balance
    mockConnection.query.mockResolvedValueOnce(); // update holding quantity

    await sellStock('AAPL', 2, 100);
    expect(mockConnection.beginTransaction).toHaveBeenCalled();
    expect(mockConnection.commit).toHaveBeenCalled();
  });

  it('should throw error when selling more than available', async () => {
    mockConnection.query.mockResolvedValueOnce([[{ quantity: 2 }]]); // not enough

    await expect(sellStock('AAPL', 5, 100)).rejects.toThrow('Insufficient holdings');
  });
});
