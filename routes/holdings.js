const express = require('express');
const router = express.Router();
const db = require('../db');

// Get holdings based on transaction history
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ticker, 
             SUM(CASE WHEN transaction_type = 'BUY' THEN quantity 
                      WHEN transaction_type = 'SELL' THEN -quantity 
                      ELSE 0 END) AS total_quantity
      FROM transactions
      GROUP BY ticker
      HAVING total_quantity > 0
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching holdings:', err);
    res.status(500).json({ error: 'Failed to fetch holdings' });
  }
});

module.exports = router;
