import { Router } from 'express';
  import { getBalanceHandler, addMoneyHandler, withdrawMoneyHandler } from '../controllers/accountController.js';

  const router = Router();
  router.get('/balance', getBalanceHandler);
  router.post('/add', addMoneyHandler);
  router.post('/withdraw', withdrawMoneyHandler);

  export default router;