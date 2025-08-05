import express from 'express';
import mysql2 from 'mysql2/promise'; 
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

// Create a MySQL connection pool with promise support
const pool = mysql2.createPool({
    host: 'localhost',
    user: 'root',  
    password: 'n3u3da!',  
    database: 'sync_financial_data',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

// Function to get the balance (async version)
app.get('/balance', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM settlement_account ORDER BY timestamp DESC LIMIT 1');
        if (results.length > 0) {
            res.json({ balance: results[0].amount });
        } else {
            res.status(404).json({ message: 'No Balance found.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Function to add money to the account (async version)
app.post('/add_money', async (req, res) => {
    const { amount } = req.body; // Get the amount from the request body

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Amount must be a valid number greater than zero.' });
    }

    try {
        // Debugging: Log the incoming amount
        console.log(`Received amount: ${amount}`);

        // Get the latest account balance
        const [results] = await pool.query('SELECT * FROM settlement_account ORDER BY timestamp DESC LIMIT 1');
        let newAmount = parseFloat(amount);
        let prevBalance = 0;

        if (results.length > 0) {
            prevBalance = parseFloat(results[0].amount); // previous balance
            newAmount += prevBalance;  // Add to the current balance
            console.log(`Previous balance: ${prevBalance}`);
            console.log(`Current balance: ${newAmount}`);
        } else {
            console.log("No previous balance found.");
        }

        // Insert the new balance into the table
        await pool.query('INSERT INTO settlement_account (amount) VALUES (?)', [newAmount]);

        res.json({
            message: `Successfully added ${amount} to the account.`,
            previous_balance: prevBalance,
            new_balance: newAmount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }

});

//Funciton ot withdraw money from the account (async version)
app.post('/withdraw_money', async (req,res) => {
    const {amount} = req.body
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Amount must be a valid number greater than zero.' });
    }
    try {
        const [results] = await pool.query('SELECT * FROM settlement_account ORDER BY timestamp DESC LIMIT 1');
        let newAmount = 0;
        let prevBalance = 0;
        if(results.length > 0){
            prevBalance = parseFloat(results[0].amount); // previous balance
            newAmount = prevBalance - parseFloat(amount)
            if (newAmount < 0) {
                return res.status(400).json({ message: 'Insufficient funds for withdrawal.' });
            }
            console.log(`Current Balance: ${newAmount}`);
            res.json({
                message:`Successfully withdrawn ${amount} from your account.`,
                previous_balance: prevBalance,
                new_balance: newAmount
            })
            await pool.query('INSERT INTO settlement_account (amount) VALUES (?)', [newAmount]);
        }
    }
    catch(error) {
        console.error(error)
        res.status(500).json({error: error.message})
    }
})

// Start the server
app.listen(8081, () => {
    console.log('Server started on http://localhost:8081');
});
