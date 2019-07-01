var mysql = require("mysql");
require("dotenv").config();
var inquirer = require("inquirer");
var connection = mysql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PWD,
    port : 3306,
    database : "bamazon"
});
var userId = Math.floor(Math.random()*100+1);
console.log("Welcome to Bamazon");
connection.query("select item_id, product_name, price from products",function(err,data){
    if (err) {
        console.log(err);
    }
    let arr = [];
    console.log("Here are our products");
    for (let index = 0; index < data.length; index++) {
        console.log(data[index].item_id +"|" +data[index].product_name +"|" +data[index].price+"$");
        arr.push(data[index].item_id+"."+data[index].product_name);
        console.log("-----------------------------------------------");
        
    }

    inquirer.prompt({
        type : "list",
        name : "item",
        message : "Which do u want to buy?",
        choices : arr
    }).then(answer=>{
        //console.log(answer.item);
        //get id
        let buyId = answer.item.substring(0,answer.item.indexOf("."));
        //console.log(buyId);
        connection.query("select stock_quantity from products where item_id = ?",buyId,function(err,data){
            if (err) {
                console.log(err);
                
            }
            let stock = data[0].stock_quantity;
            inquirer.prompt({
                type : "input",
                name : "quantity",
                message : "How many do u need?",
                default : 1
            }).then(answer=>{
                let quantity = answer.quantity;
                if(quantity>0){
                    if(quantity>stock){
                        console.log("stock not enough");
                    }else{
                        //cart table
                        //check chart 
                        connection.query("select *from chart where user_id = ? and item_id = ?",[userId,buyId],function(err,data){
                                if (data.length>0) {
                                    //have the same item
                                    connection.query("update chart set quantity = quantity + ? where user_id = ? and item_id = ? ",[quantity,userId,buyId],function(err,data){
                                            if(data.affectedRows == 1) {
                                                console.log("success");
                                            }
                                    });
                                }else{
                                    connection.query("insert into chart set ?",{
                                        item_id : buyId,
                                        quantity : quantity,
                                        user_id : userId
                                    },function(err,data){
                                        if (err) {
                                            console.log(err);
                                        }
                                        if (data.affectedRows ==1) {
                                            console.log("success");
                                        }
                                    });
                                }
                        });
                        //products table
                        //use bamazon;update products set stock_quantity = stock_quantity-1 where item_id = 2;
                        connection.query("update products set stock_quantity = stock_quantity - ? where item_id = ?",[quantity,buyId],function (err,data) {
                            if(err){
                                console.log(err);
                            }
                            if (data.affectedRows == 1) {
                                console.log("successs");
                            }
                        });
                    }
                }else{
                    console.log("wrong input #");
                }
            });
        });
    });
});