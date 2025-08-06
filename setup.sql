-- Database setup script for the stock trading platform

-- Create database (run this first if database doesn't exist)
-- CREATE DATABASE IF NOT EXISTS stock_trading_db;
-- USE stock_trading_db;

-- Create transactions table


create database if not exists sync_financial_data;
USE sync_financial_data;
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  transaction_type ENUM('buy', 'sell') NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create account_balance table
CREATE TABLE IF NOT EXISTS account_balance (
  id INT PRIMARY KEY DEFAULT 1,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0.00
);

-- Create portfolio table
CREATE TABLE IF NOT EXISTS portfolio (
  ticker VARCHAR(10) PRIMARY KEY,
  quantity INT NOT NULL DEFAULT 0,
  average_price DECIMAL(10,2) NOT NULL DEFAULT 0.00
);

-- Create balance table (for transactions.js)
CREATE TABLE IF NOT EXISTS balance (
  id INT PRIMARY KEY DEFAULT 1,
  amount DECIMAL(10,2) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial balance
/*INSERT INTO account_balance (id, balance) VALUES (1, 10000.00) ON DUPLICATE KEY UPDATE balance = 10000.00;
INSERT INTO balance (id, amount) VALUES (1, 10000.00) ON DUPLICATE KEY UPDATE amount = 10000.00;*/

-- Create indexes for better performance
CREATE INDEX idx_transactions_ticker ON transactions(ticker);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
