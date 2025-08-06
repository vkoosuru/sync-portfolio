create database sync_financial_data;

use sync_financial_data;

create table transactions(
transaction_id int auto_increment primary key,
ticker varchar(10) not null,
quantity int not null,
price decimal(10,2)not null,
transaction_type enum('BUY','SELL') not null,
timestamp timestamp default current_timestamp,
total_amount decimal(15,2) generated always as (quantity * price) stored
);

create table settlement_account(
sid int auto_increment primary key,
amount decimal(15,2) not null,
timestamp timestamp default current_timestamp
);



