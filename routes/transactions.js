const express = require('express');
const router = express.Router();
const db = require('../db'); // mysql2 pool

// BUY STOCK
router.post('/buy', async (req, res) => {
  const { ticker, quantity, price } = req.body;

  if (!ticker || !quantity || !price) {
    return res.status(400).json({ error: 'Missing ticker, quantity or price' });
  }

  const total = quantity * price;
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [balanceRows] = await connection.query(
      `SELECT amount FROM account_balance ORDER BY timestamp DESC LIMIT 1`
    );

    if (!balanceRows.length) {
      await connection.rollback();
      return res.status(400).json({ error: 'No balance record found' });
    }

    const currentBalance = parseFloat(balanceRows[0].amount);
    if (currentBalance < total) {
      await connection.rollback();
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    await connection.query(
      `INSERT INTO transactions (ticker, quantity, price, transaction_type)
       VALUES (?, ?, ?, 'buy')`,
      [ticker, quantity, price]
    );

    const newBalance = currentBalance - total;
    await connection.query(
      `INSERT INTO account_balance (amount, timestamp) VALUES (?, NOW())`,
      [newBalance]
    );

    await connection.query(
      `INSERT INTO portfolio (ticker, quantity, average_price)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         quantity = quantity + VALUES(quantity),
         average_price = (
           (average_price * quantity + VALUES(average_price) * VALUES(quantity))
           / (quantity + VALUES(quantity))
         )`,
      [ticker, quantity, price]
    );

    await connection.commit();
    res.status(200).json({ message: 'Buy successful' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Buy transaction error:', error);
    res.status(500).json({ error: 'Error during buy transaction' });
  } finally {
    if (connection) connection.release();
  }
});

// SELL STOCK
router.post('/sell', async (req, res) => {
  const { ticker, quantity, price } = req.body;

  if (!ticker || !quantity || !price) {
    return res.status(400).json({ error: 'Missing ticker, quantity or price' });
  }

  const total = quantity * price;
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Get stock quantity and average buy price
    const [portfolioRows] = await connection.query(
      `SELECT quantity, average_price FROM portfolio WHERE ticker = ?`,
      [ticker]
    );

    if (!portfolioRows.length || portfolioRows[0].quantity < quantity) {
      await connection.rollback();
      return res.status(400).json({ error: 'Not enough shares to sell' });
    }

    const avgBuyPrice = parseFloat(portfolioRows[0].average_price);
    const pl = (price - avgBuyPrice) * quantity;

    // Insert sell transaction with P/L
    await connection.query(
      `INSERT INTO transactions (ticker, quantity, price, transaction_type, pl)
       VALUES (?, ?, ?, 'sell', ?)`,
      [ticker, quantity, price, pl]
    );

    // Update balance
    const [balanceRows] = await connection.query(
      `SELECT amount FROM account_balance ORDER BY timestamp DESC LIMIT 1`
    );

    const currentBalance = parseFloat(balanceRows[0].amount);
    const newBalance = currentBalance + total;

    await connection.query(
      `INSERT INTO account_balance (amount, timestamp) VALUES (?, NOW())`,
      [newBalance]
    );

    // Update portfolio
    await connection.query(
      `UPDATE portfolio SET quantity = quantity - ? WHERE ticker = ?`,
      [quantity, ticker]
    );

    await connection.query(
      `DELETE FROM portfolio WHERE ticker = ? AND quantity <= 0`,
      [ticker]
    );

    await connection.commit();
    res.status(200).json({ message: 'Sell successful', profit_loss: pl });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Sell transaction error:', error);
    res.status(500).json({ error: 'Error during sell transaction' });
  } finally {
    if (connection) connection.release();
  }
});

// GET TRANSACTION HISTORY
router.get('/history', async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query(
      `SELECT * FROM transactions ORDER BY timestamp DESC`
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  } finally {
    if (connection) connection.release();
  }
});



module.exports = router;
