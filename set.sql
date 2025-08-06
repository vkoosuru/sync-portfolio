-- Create and use database
CREATE DATABASE IF NOT EXISTS sync_financial_data;
USE sync_financial_data;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  transaction_type ENUM('buy', 'sell') NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ Ledger-style account_balance table with timestamp
CREATE TABLE IF NOT EXISTS account_balance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio table
CREATE TABLE IF NOT EXISTS portfolio (
  ticker VARCHAR(10) PRIMARY KEY,
  quantity INT NOT NULL DEFAULT 0,
  average_price DECIMAL(10,2) NOT NULL DEFAULT 0.00
);

-- Indexes for performance
CREATE INDEX idx_transactions_ticker ON transactions(ticker);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_account_balance_timestamp ON account_balance(timestamp);

-- Optional: Seed initial balance
INSERT INTO account_balance (amount) VALUES (10000.00);
