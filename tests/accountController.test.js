import { jest } from '@jest/globals';

// Step 1: Mock all required functions
const mockGetBalance = jest.fn();
const mockAddMoney = jest.fn();
const mockWithdrawMoney = jest.fn();

jest.unstable_mockModule('../services/accountService.js', () => ({
  getBalance: mockGetBalance,
  addMoney: mockAddMoney,
  withdrawMoney: mockWithdrawMoney
}));

// Step 2: Dynamically import AFTER mocks
const { getBalanceHandler } = await import('../controllers/accountController.js');
const accountService = await import('../services/accountService.js');

describe('getBalanceHandler', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  it('should return balance', async () => {
    accountService.getBalance.mockResolvedValue(1000);
    await getBalanceHandler(req, res);
    expect(res.json).toHaveBeenCalledWith({ balance: 1000 });
  });

  it('should handle error', async () => {
    accountService.getBalance.mockRejectedValue(new Error('DB error'));
    await getBalanceHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
  });
});
