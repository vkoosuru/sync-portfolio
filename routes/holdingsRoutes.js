import express from 'express';
import { getHoldingsHandler, buyStockHandler, sellStockHandler } from '../controllers/holdingsController.js';

const router = express.Router();

router.get('/', getHoldingsHandler);
router.post('/add', buyStockHandler);
router.delete('/remove', sellStockHandler);

export default router;
