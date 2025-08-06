import { getBalance, addMoney, withdrawMoney } from '../services/accountService.js';

export async function getBalanceHandler(req, res) {
  try {
    const balance = await getBalance();
    console.log(`Current balance: ${balance}`);
    res.json({ balance });
  } catch (err) {
    console.error('Error in getBalanceHandler:', err.message);
    res.status(500).json({ error: err.message });
  }
}

export async function addMoneyHandler(req, res) {
  const { amount } = req.body;
  try {
    const result = await addMoney(amount);
    res.json(result);
  } catch (err) {
    console.error('Error in addMoneyHandler:', err.message);
    res.status(400).json({ error: err.message });
  }
}

export async function withdrawMoneyHandler(req, res) {
  const { amount } = req.body;
  try {
    const result = await withdrawMoney(amount);
    res.json(result);
  } catch (err) {
    console.error('Error in withdrawMoneyHandler:', err.message);
    res.status(400).json({ error: err.message });
  }
}