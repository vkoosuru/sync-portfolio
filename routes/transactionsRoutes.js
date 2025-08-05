import express from 'express';
import { getTransactionsHandler } from '../controllers/transactionsController.js';

const router = express.Router();

router.get('/', getTransactionsHandler);

export default router;
