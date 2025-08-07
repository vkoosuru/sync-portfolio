CREATE DATABASE IF NOT EXISTS sync_financial_data;
USE sync_financial_data;


CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    transaction_type ENUM('BUY','SELL') not null,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(15,2) generated always as (quantity*price) stored
);

create table settlement_account(
 sid int auto_increment primary key,
 amount decimal(15,2)not null,
 timestamp timestamp default current_timestamp
);
CREATE TABLE holdings (
    ticker VARCHAR(10) PRIMARY KEY,
    quantity INT NOT NULL,
    buy_price DECIMAL(10,2) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);