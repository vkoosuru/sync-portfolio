const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /api/account/deposit
router.post('/deposit', async (req, res) => {
  const { amount } = req.body;

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number.' });
  }

  try {
    // Get latest balance
    const [results] = await pool.query('SELECT amount FROM account_balance ORDER BY timestamp DESC LIMIT 1');
    const prevBalance = results.length > 0 ? parseFloat(results[0].amount) : 0;
    const newBalance = prevBalance + parseFloat(amount);

    // Insert new balance entry
    await pool.query('INSERT INTO account_balance (amount) VALUES (?)', [newBalance]);

    res.json({
      message: `Successfully deposited ₹${amount}.`,
      previous_balance: prevBalance,
      new_balance: newBalance
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/account/withdraw
router.post('/withdraw', async (req, res) => {
  const { amount } = req.body;

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number.' });
  }

  try {
    // Get latest balance
    const [results] = await pool.query('SELECT amount FROM account_balance ORDER BY timestamp DESC LIMIT 1');
    const prevBalance = results.length > 0 ? parseFloat(results[0].amount) : 0;

    if (prevBalance < amount) {
      return res.status(400).json({ message: 'Insufficient funds.' });
    }

    const newBalance = prevBalance - parseFloat(amount);

    // Insert new balance entry
    await pool.query('INSERT INTO account_balance (amount) VALUES (?)', [newBalance]);

    res.json({
      message: `Successfully withdrew ₹${amount}.`,
      previous_balance: prevBalance,
      new_balance: newBalance
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/account/balance
router.get('/balance', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT amount FROM account_balance ORDER BY timestamp DESC LIMIT 1');
    const balance = results.length > 0 ? results[0].amount : 0;
    res.json({ balance });
  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
