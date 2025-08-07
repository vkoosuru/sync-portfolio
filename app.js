import express from 'express';
import cors from 'cors';
import yaml from 'js-yaml';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import holdingsRoutes from './routes/holdingsRoutes.js';
import transactionsRoutes from './routes/transactionsRoutes.js';
import accountRoutes from './routes/accountRoutes.js';

const app = express();
app.use(cors({ origin: ['http://localhost:8080', 'http://172.30.0.46:8080'] })); // Allow both origins
app.use(express.json());
app.use(express.static('frontend'));

// Serve a dummy favicon to suppress 404
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

const swaggerDocument = yaml.load(fs.readFileSync('./openapi.yaml', 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/holdings', holdingsRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/account', accountRoutes);

app.listen(3000, () => console.log('Server started on port 3000'));