import express from 'express';
import holdingsRoutes from './routes/holdingsRoutes.js';
import transactionsRoutes from './routes/transactionsRoutes.js';
import accountRoutes from './routes/accountRoutes.js';

const app = express();
app.use(express.json());

app.use('/holdings', holdingsRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/account', accountRoutes);

export default app; // ✅ This allows Jest to use the app without starting the server

if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => console.log('Server started on port 3000'));
}
