import { getHoldings, buyStock, sellStock } from '../services/holdingsService.js';

export async function getHoldingsHandler(req, res) {
  console.log('Handling request to get holdings');
  try {
    const data = await getHoldings();
    if (data.length === 0) {
      console.log('No holdings found in the database');
      res.json([]);
    } else {
      res.json(data);
    }
  } catch (err) {
    console.error('Error in getHoldingsHandler:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function buyStockHandler(req, res) {
  const { ticker, quantity, price } = req.body;
  try {
    await buyStock(ticker, parseInt(quantity), parseFloat(price));
    res.send('Stock bought');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function sellStockHandler(req, res) {
  const { ticker, quantity, price } = req.body;
  try {
    await sellStock(ticker, parseInt(quantity), parseFloat(price));
    res.send('Stock sold');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
