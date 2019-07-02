var mysql = require("mysql");
require("dotenv").config();
var inquirer = require("inquirer");
var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    port: 3306,
    database: "bamazon"
});
function viewSale(){
    connection.query("select item_id,product_name,price,stock_quantity from products where stock_quantity > 0",function(err,data){
        if (err) {
            console.log(err);
        }
        for (let index = 0; index < data.length; index++) {
            console.log(data[index]);
        }
    });
}
function viewLowInventory(){
    connection.query("select *from products where stock_quantity<5",function(err,data){
        if (err) {
            console.log(err);
            
        }
        //data needs further format 
        console.log(data);
        
    });
}
function main() {
    inquirer.prompt({
        type: "list",
        name: "option",
        message: "Choose an option",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "quit"]
    }).then(answer => {
        switch (answer.option) {
            case "View Products for Sale":
                viewSale();
                main();
                break;
            case "Add to Inventory":
                addInventory();
                main();
                break;
            case "View Low Inventory":
                viewLowInventory();
                main();
                break;
            case "Add New Product":
                addNewItem();
                main();
                break;
            default:
                connection.end();
                break;
        }
    });
}
main();