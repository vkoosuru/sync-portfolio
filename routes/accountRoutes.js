import express from 'express';
import { getBalanceHandler, addMoneyHandler, withdrawMoneyHandler } from '../controllers/accountController.js';

const router = express.Router();

router.get('/', getBalanceHandler);
router.post('/add', addMoneyHandler);
router.post('/withdraw', withdrawMoneyHandler);

export default router;