import pool from '../models/db.js';
import queries from '../models/queries.js';
import { fetchCurrentPrice } from '../utils/priceFetcher.js';

export async function getHoldings() {
  const [rows] = await pool.query(queries.getAllHoldings);
  return await Promise.all(rows.map(async (row) => {
    const currentPrice = await fetchCurrentPrice(row.ticker);
    let pnl = null;
    if (currentPrice !== null && row.buy_price !== null) {
      pnl = ((currentPrice - row.buy_price) / row.buy_price) * 100;
      pnl = pnl.toFixed(2) + '%';
    } else {
      console.warn(`PnL not calculated for ${row.ticker} due to missing price data`);
      pnl = 'N/A';
    }
    return {
      ticker: row.ticker,
      quantity: row.quantity,
      buy_price: row.buy_price,
      current_price: currentPrice !== null ? currentPrice : 'N/A',
      pnl
    };
  }));
}

export async function buyStock(ticker, quantity, price) {
  const validTickers = ['C', 'AMZN', 'TSLA', 'FB', 'AAPL'];
  if (!validTickers.includes(ticker)) {
    throw new Error('Invalid ticker');
  }
  if (quantity <= 0 || price <= 0) {
    throw new Error('Quantity and price must be positive');
  }
  const total = price * quantity;
  const [settlement] = await pool.query('SELECT SUM(amount) as balance FROM settlement_account');
  let balance = settlement[0].balance || 0; //const
  balance=1000000; // Set a default balance for testing purposes
  if (balance < total) {
    throw new Error('Insufficient funds');
  }

  const [existing] = await pool.query(queries.getHoldingByTicker, [ticker]);
  await pool.query(queries.insertTransaction, [ticker, quantity, price, 'BUY']);
  await pool.query(queries.insertSettlement, [-total]);

  if (existing.length) {
    const row = existing[0];
    const newQty = row.quantity + quantity;
    const newAvgPrice = ((row.buy_price * row.quantity) + (price * quantity)) / newQty;
    await pool.query(queries.updateHolding, [newQty, newAvgPrice, ticker]);
  } else {
    await pool.query(queries.insertHolding, [ticker, quantity, price]);
  }
}

export async function sellStock(ticker, quantity, price) {
  const validTickers = ['C', 'AMZN', 'TSLA', 'FB', 'AAPL'];
  if (!validTickers.includes(ticker)) {
    throw new Error('Invalid ticker');
  }
  if (quantity <= 0 || price <= 0) {
    throw new Error('Quantity and price must be positive');
  }
  const [existing] = await pool.query(queries.getHoldingByTicker, [ticker]);
  if (!existing.length || existing[0].quantity < quantity) {
    throw new Error('Not enough quantity');
  }
  const total = price * quantity;

  await pool.query(queries.insertTransaction, [ticker, quantity, price, 'SELL']);
  await pool.query(queries.insertSettlement, [total]);

  const remainingQty = existing[0].quantity - quantity;
  if (remainingQty === 0) {
    await pool.query(queries.deleteHolding, [ticker]);
  } else {
    await pool.query(queries.updateHolding, [remainingQty, existing[0].buy_price, ticker]);
  }
}