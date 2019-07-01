DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR (100),
    department_name VARCHAR (100),
    price DECIMAL (20,2),
    stock_quantity INT (20)
);