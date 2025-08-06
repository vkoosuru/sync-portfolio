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
  const validTickers = ['C', 'AMZN', 'TSLA', 'META', 'AAPL'];
  if (!validTickers.includes(ticker)) {
    throw new Error('Invalid ticker');
  }
  if (quantity <= 0 || price <= 0) {
    throw new Error('Quantity and price must be positive');
  }
  const total = price * quantity;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // Fetch the latest balance from settlement_account
    const [results] = await connection.query(queries.getLatestBalance);
    let balance = 0;
    if (results.length > 0) {
      balance = parseFloat(results[0].amount);
      console.log(`Previous balance: ${balance}`);
    } else {
      console.log('No previous balance found');
    }
    const newBalance = balance - total;
    if (newBalance < 0) {
      throw new Error('Insufficient funds');
    }

    const [existing] = await connection.query(queries.getHoldingByTicker, [ticker]);
    await connection.query(queries.insertTransaction, [ticker, quantity, price, 'BUY']);
    await connection.query(queries.insertSettlement, [newBalance]);

    if (existing.length) {
      const row = existing[0];
      const newQty = row.quantity + quantity;
      const newAvgPrice = ((row.buy_price * row.quantity) + (price * quantity)) / newQty;
      await connection.query(queries.updateHolding, [newQty, newAvgPrice, ticker]);
    } else {
      await connection.query(queries.insertHolding, [ticker, quantity, price]);
    }
    await connection.commit();
    console.log(`Successfully bought ${quantity} shares of ${ticker} at ${price}, New balance: ${newBalance}`);
  } catch (err) {
    await connection.rollback();
    console.error(`Failed to buy ${ticker}:`, err.message);
    throw err;
  } finally {
    connection.release();
  }
}

export async function sellStock(ticker, quantity, price) {
  const validTickers = ['C', 'AMZN', 'TSLA', 'META', 'AAPL'];
  if (!validTickers.includes(ticker)) {
    throw new Error('Invalid ticker');
  }
  if (quantity <= 0 || price <= 0) {
    throw new Error('Quantity and price must be positive');
  }
  const total = price * quantity;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existing] = await connection.query(queries.getHoldingByTicker, [ticker]);
    if (!existing.length || existing[0].quantity < quantity) {
      throw new Error('Not enough quantity');
    }

    // Fetch the latest balance from settlement_account
    const [results] = await connection.query(queries.getLatestBalance);
    let newBalance = total;
    if (results.length > 0) {
      const prevBalance = parseFloat(results[0].amount);
      newBalance += prevBalance;
      console.log(`Previous balance: ${prevBalance}, Sale proceeds: ${total}, New balance: ${newBalance}`);
    } else {
      console.log('No previous balance found, using sale proceeds as new balance');
    }

    await connection.query(queries.insertTransaction, [ticker, quantity, price, 'SELL']);
    await connection.query(queries.insertSettlement, [newBalance]);

    const remainingQty = existing[0].quantity - quantity;
    if (remainingQty === 0) {
      await connection.query(queries.deleteHolding, [ticker]);
    } else {
      await connection.query(queries.updateHolding, [remainingQty, existing[0].buy_price, ticker]);
    }
    await connection.commit();
    console.log(`Successfully sold ${quantity} shares of ${ticker} at ${price}`);
  } catch (err) {
    await connection.rollback();
    console.error(`Failed to sell ${ticker}:`, err.message);
    throw err;
  } finally {
    connection.release();
  }
}