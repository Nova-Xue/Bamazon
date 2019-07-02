var mysql = require("mysql");
var table = require("table");
require("dotenv").config();
var inquirer = require("inquirer");
var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    port: 3306,
    database: "bamazon"
});
var userId = Math.floor(Math.random() * 100 + 1);
console.log("Welcome to Bamazon");
connection.query("select item_id, product_name, price from products", function (err, data) {
    if (err) {
        console.log(err);
    }
    let arr = [];
    console.log("Here are our products");
    for (let index = 0; index < data.length; index++) {
        console.log(data[index].item_id + "|" + data[index].product_name + "|" + data[index].price + "$");
        arr.push(data[index].item_id + "." + data[index].product_name);
        console.log("-----------------------------------------------");
    }
    main(arr);
});
function main(param) {
    inquirer.prompt([{
        type: "list",
        name: "item",
        message: "Which do u want to buy?",
        choices: param
    }, {
        type: "input",
        name: "quantity",
        message: "How many do u need?(type 'quit' to quit)",
        default: 1
    }]).then(answers => {
        if (answers.quantity == "quit") {
            //end connection after quit
            connection.end();
        } else {
            //validatie isNumber
            if (parseInt(answers.quantity) == NaN) {
                console.log("not a #");
                main(param);
            } else {
                //get id
                let buyId = answers.item.substring(0, answers.item.indexOf("."));
                let quantity = answers.quantity;
                if (quantity > 0) {
                    //check stock
                    connection.query("select stock_quantity from products where item_id = ?", buyId, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        let stock = data[0].stock_quantity;
                        if (quantity > stock) {
                            //stock lower than quantiy
                            console.log("not enough stock");
                            main(param);
                        } else {//enough stock
                            //update chart
                            connection.query("select *from chart where user_id = ? and item_id = ?", [userId, buyId], function (err, data) {
                                if (data.length > 0) {//update existing chart
                                    connection.query("update chart set quantity = quantity + ? where user_id = ? and item_id = ? ", [quantity, userId, buyId], function (err, data) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        if (data.affectedRows == 1) {
                                            console.log("success charts update");
                                        }
                                    });
                                } else {//insert into chart
                                    connection.query("insert into chart set ?", {
                                        item_id: buyId,
                                        quantity: quantity,
                                        user_id: userId
                                    }, function (err, data) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        if (data.affectedRows == 1) {
                                            console.log("success add to chart");
                                        }
                                    });
                                }
                            });
                            //update product_sales
                            //update products
                            connection.query("update products set stock_quantity = stock_quantity - ?,product_sales = product_sales + (price * ?) where item_id = ?", [quantity,quantity,buyId], function (err, data) {
                                if (err) {
                                    console.log(err);
                                }
                                if (data.affectedRows == 1) {
                                    console.log("success update products");
                                    //show total price
                                    //can use data base to do the math
                                    connection.query("select quantity,products.price,products.product_name from chart left join products on chart.item_id=products.item_id where user_id = ?",userId,function(err,data){
                                        if (err) {
                                            console.log(err);
                                        }    
                                        let subtotal = 0;
                                        console.log("Your chart :");
                                        let dataArr = [["name","price","quantity","total"]];
                                        for (let index = 0; index < data.length; index++) {
                                                dataArr.push([data[index].product_name,data[index].price,data[index].quantity,data[index].quantity*data[index].price]);
                                                subtotal += data[index].quantity*data[index].price;
                                            }
                                        dataArr.push(["","","subtotal",subtotal]);
                                        console.log(table.table(dataArr));
                                        
                                            main(param);
                                    });
                                }
                            });
                        }
                    });
                } else {//wrong #
                    console.log("wrong input #");
                    main(param);
                }
            }
            
        }
    });
}