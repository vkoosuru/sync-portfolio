export default {
  getAllHoldings: 'SELECT * FROM holdings',
  getHoldingByTicker: 'SELECT * FROM holdings WHERE ticker = ?',
  insertTransaction: 'INSERT INTO transactions (ticker, quantity, price, transaction_type) VALUES (?, ?, ?, ?)',
  insertSettlement: 'INSERT INTO settlement_account (amount) VALUES (?)',
  updateHolding: 'UPDATE holdings SET quantity = ?, buy_price = ? WHERE ticker = ?',
  insertHolding: 'INSERT INTO holdings (ticker, quantity, buy_price) VALUES (?, ?, ?)',
  deleteHolding: 'DELETE FROM holdings WHERE ticker = ?',
  getTransactions: 'SELECT transaction_id, ticker, quantity, timestamp, total_amount, transaction_type AS action FROM transactions'
};