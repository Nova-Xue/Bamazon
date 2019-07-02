USE bamazon;
CREATE TABLE departments (
    department_id int PRIMARY KEY auto_increment,
    department_name VARCHAR (100) not null,
    over_head_costs DECIMAL (10,2) not null
);  