var mysql = require("mysql");
require("dotenv").config();
var connection = mysql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PWD,
    port : 3306,
    database : "bamazon"
});
console.log("Welcome to Bamazon");
connection.query("select *from products",function(err,data){
    if (err) {
        console.log(err);
        
    }
    for (let index = 0; index < data.length; index++) {
        console.log(data[index]);
    }
    //connection.end();
});