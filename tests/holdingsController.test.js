// tests/holdingsController.test.js
import { jest } from '@jest/globals';

// Step 1: Mock service functions
const mockGetHoldings = jest.fn();
const mockBuyStock = jest.fn();
const mockSellStock = jest.fn();

jest.unstable_mockModule('../services/holdingsService.js', () => ({
  getHoldings: mockGetHoldings,
  buyStock: mockBuyStock,
  sellStock: mockSellStock
}));

// Step 2: Import after mocks are set
const {
  getHoldingsHandler,
  buyStockHandler,
  sellStockHandler
} = await import('../controllers/holdingsController.js');

describe('Holdings Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getHoldingsHandler', () => {
    it('should return holdings data', async () => {
      const mockData = [{ ticker: 'AAPL', quantity: 10 }];
      mockGetHoldings.mockResolvedValue(mockData);

      await getHoldingsHandler(req, res);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should return empty array when no data', async () => {
      mockGetHoldings.mockResolvedValue([]);

      await getHoldingsHandler(req, res);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle error and return 500', async () => {
      mockGetHoldings.mockRejectedValue(new Error('DB error'));

      await getHoldingsHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
    });
  });

  describe('buyStockHandler', () => {
    it('should buy stock and send confirmation', async () => {
      req.body = { ticker: 'AAPL', quantity: 5, price: 100 };
      mockBuyStock.mockResolvedValue();

      await buyStockHandler(req, res);
      expect(mockBuyStock).toHaveBeenCalledWith('AAPL', 5, 100);
      expect(res.send).toHaveBeenCalledWith('Stock bought');
    });

    it('should handle error and return 400', async () => {
      req.body = { ticker: 'AAPL', quantity: 5, price: 100 };
      mockBuyStock.mockRejectedValue(new Error('Insufficient funds'));

      await buyStockHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient funds' });
    });
  });

  describe('sellStockHandler', () => {
    it('should sell stock and send confirmation', async () => {
      req.body = { ticker: 'AAPL', quantity: 5, price: 100 };
      mockSellStock.mockResolvedValue();

      await sellStockHandler(req, res);
      expect(mockSellStock).toHaveBeenCalledWith('AAPL', 5, 100);
      expect(res.send).toHaveBeenCalledWith('Stock sold');
    });

    it('should handle error and return 400', async () => {
      req.body = { ticker: 'AAPL', quantity: 5, price: 100 };
      mockSellStock.mockRejectedValue(new Error('Not enough shares'));

      await sellStockHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not enough shares' });
    });
  });
});
