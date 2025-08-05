import express from 'express';
import holdingsRoutes from './routes/holdingsRoutes.js';
import transactionsRoutes from './routes/transactionsRoutes.js';

const app = express();
app.use(express.json());

app.use('/holdings', holdingsRoutes);
app.use('/transactions', transactionsRoutes);

app.listen(3000, () => console.log('Server started on port 3000'));
