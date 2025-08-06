import pool from '../models/db.js';
import queries from '../models/queries.js';

export async function getBalance() {
  const [results] = await pool.query(queries.getLatestBalance);
  if (results.length > 0) {
    return results[0].amount;
  }
  throw new Error('No balance found');
}

export async function addMoney(amount) {
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Amount must be a valid number greater than zero');
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [results] = await connection.query(queries.getLatestBalance);
    let newAmount = parseFloat(amount);
    let prevBalance = 0;

    if (results.length > 0) {
      prevBalance = parseFloat(results[0].amount);
      newAmount += prevBalance;
      console.log(`Previous balance: ${prevBalance}, New balance: ${newAmount}`);
    } else {
      console.log('No previous balance found');
    }

    await connection.query(queries.insertSettlement, [newAmount]);
    await connection.commit();
    console.log(`Successfully added ${amount} to account`);
    return {
      message: `Successfully added ${amount} to the account`,
      previous_balance: prevBalance,
      new_balance: newAmount
    };
  } catch (err) {
    await connection.rollback();
    console.error('Failed to add money:', err.message);
    throw err;
  } finally {
    connection.release();
  }
}

export async function withdrawMoney(amount) {
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Amount must be a valid number greater than zero');
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [results] = await connection.query(queries.getLatestBalance);
    if (results.length === 0) {
      throw new Error('No balance found');
    }
    const prevBalance = parseFloat(results[0].amount);
    const newAmount = prevBalance - parseFloat(amount);
    if (newAmount < 0) {
      throw new Error('Insufficient funds for withdrawal');
    }
    await connection.query(queries.insertSettlement, [newAmount]);
    await connection.commit();
    console.log(`Successfully withdrawn ${amount}, New balance: ${newAmount}`);
    return {
      message: `Successfully withdrawn ${amount} from the account`,
      previous_balance: prevBalance,
      new_balance: newAmount
    };
  } catch (err) {
    await connection.rollback();
    console.error('Failed to withdraw money:', err.message);
    throw err;
  } finally {
    connection.release();
  }
}