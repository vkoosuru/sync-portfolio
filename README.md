# *sync-portfolio*
Stock Portfolio Backend

Overview
--------
This is the backend for a stock portfolio management application built with Node.js, Express, and MySQL. It allows users to manage stock holdings, track buy/sell transactions, and handle account balances. The API provides endpoints to buy/sell stocks, view holdings with current prices and profit/loss percentages, retrieve transaction history, and manage funds in a settlement account.

Features
--------
- Holdings Management: Add, remove, and view stock holdings with current prices and profit/loss percentages.
- Transaction Tracking: Record buy/sell transactions with details like ticker, quantity, price, and timestamp.
- Account Balance: Check, add, or withdraw funds from a settlement account.
- External Price Data: Fetches current stock prices from an external API.

Prerequisites
-------------
- Node.js: v22.14.0 or higher
- MySQL: v8.0 or higher
- npm: For dependency management
- Git: For cloning the repository

Setup Instructions
------------------
1. Clone the Repository:
   git clone <repository-url>
   cd sync-portfolio

2. Install Dependencies:
   npm install
   Required packages (in package.json):
   - express: ^4.17.1
   - mysql2: ^3.9.7
   - axios: ^1.6.7

3. Set Up MySQL Database:
   - Create a database named sync_financial_data:
     CREATE DATABASE sync_financial_data;
   - Create tables (holdings, transactions, settlement_account):
     USE sync_financial_data;

     CREATE TABLE holdings (
       ticker VARCHAR(10) PRIMARY KEY,
       quantity INT NOT NULL,
       buy_price DECIMAL(10,2) NOT NULL,
       last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
     );

     CREATE TABLE transactions (
       transaction_id INT AUTO_INCREMENT PRIMARY KEY,
       ticker VARCHAR(10) NOT NULL,
       quantity INT NOT NULL,
       price DECIMAL(10,2) NOT NULL,
       transaction_type ENUM('BUY','SELL') NOT NULL,
       timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       total_amount DECIMAL(15,2) GENERATED ALWAYS AS (quantity * price) STORED
     );

     CREATE TABLE settlement_account (
       sid INT AUTO_INCREMENT PRIMARY KEY,
       amount DECIMAL(15,2) NOT NULL,
       timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );
   - Initialize with a test balance:
     INSERT INTO settlement_account (amount) VALUES (1000000);

4. Configure Database Connection:
   - The database connection is defined in app.js. Update the MySQL credentials if needed:
     const pool = mysql2.createPool({
       host: 'localhost',
       user: 'root',
       password: 'n3u3da!',
       database: 'sync_financial_data',
       waitForConnections: true,
       connectionLimit: 5,
       queueLimit: 0
     });

5. Run the Application:
   npm start
   - The server runs on http://localhost:3000.

API Endpoints
------------
- GET /holdings
  Description: Retrieves all holdings with current prices and PnL.
  Request Body: None

- POST /holdings/add
  Description: Buys a stock, updating holdings and balance.
  Request Body: {"ticker": "META", "quantity": 10, "price": 202.50}

- DELETE /holdings/remove
  Description: Sells a stock, updating holdings and balance.
  Request Body: {"ticker": "META", "quantity": 5, "price": 203.75}

- GET /transactions
  Description: Lists all buy/sell transactions.
  Request Body: None

- GET /account
  Description: Retrieves the latest account balance.
  Request Body: None

- POST /account/add
  Description: Adds funds to the settlement account.
  Request Body: {"amount": 500}

- POST /account/withdraw
  Description: Withdraws funds from the settlement account.
  Request Body: {"amount": 200}

Notes:
- Valid Tickers: C, AMZN, TSLA, META, AAPL
- Responses: Success returns data (e.g., {"balance": 1000000}) or a message (e.g., "Stock bought"). Errors return {"error": "<message>"}.
- Balance Management: Buy/sell operations update the cumulative balance in settlement_account.



External Dependencies
--------------------
- Price API: Fetches stock prices from https://c4rm9elh30.execute-api.us-east-1.amazonaws.com/default/cachedPriceData?ticker=<TICKER>
  - Ensure internet connectivity for price data.
  - Invalid prices return "N/A" in /holdings response.

Troubleshooting
---------------
- Database Errors: Verify MySQL is running and credentials in app.js are correct.
- CORS Issues: If connecting from a frontend on a different port, enable cors in app.js:
  app.use(cors());
- Logs: Check server logs for errors (console.log and console.error in app.js).

Contributing
------------
- Fork the repository, create a branch, and submit a pull request with changes.
- Ensure tests pass and database schema is unchanged.

License
-------
MIT License
