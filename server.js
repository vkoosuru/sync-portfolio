const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Import route files
const transactionsRoutes = require('./routes/transactions');
const holdingsRoutes = require('./routes/holdings');
const accountRoutes = require('./routes/account');
const stockRoutes = require('./routes/stocks');

// ✅ Mount routes with API prefixes
app.use('/api/account', accountRoutes);        // Deposit, Withdraw, Balance
app.use('/api/transactions', transactionsRoutes);
app.use('/api/holdings', holdingsRoutes);
app.use('/api/stocks', stockRoutes);

// ✅ 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).send(`Cannot ${req.method} ${req.url}`);
});

// ✅ Start server
app.listen(5000, () => console.log('Server started on port 5000'));
