const express = require('express');
const yahooFinance = require('yahoo-finance2').default;
const router = express.Router();

router.get('/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  try {
    const quote = await yahooFinance.quote(`${ticker}.NS`);
    res.json({
      ticker,
      price: quote.regularMarketPrice,
      currency: quote.currency,
      exchange: quote.fullExchangeName,
      time: quote.regularMarketTime
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching stock data' });
  }
});

module.exports = router;