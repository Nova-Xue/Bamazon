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
        main();
    });
}
function viewLowInventory(){
    connection.query("select *from products where stock_quantity<5",function(err,data){
        if (err) {
            console.log(err);
            
        }
        //data needs further format 
        if(data.length==0){
            console.log("everything enough");
            
        }else{
            console.log(data);
        }
        main();
        
    });
}
function addInventory(){
    connection.query("select *from products",function(err,data){
        if (err) {
            console.log(err);
            
        }
        let newArr = [];
        for (let index = 0; index < data.length; index++) {
            
            newArr.push(data[index].item_id+"."+data[index].product_name+"||"+data[index].stock_quantity);

        }
        console.log(newArr);
        

        inquirer.prompt([{
            type : "list",
            name : "item",
            message : "Choose an item to add",
            choices : newArr
        },{
            type : "input",
            name : "add",
            message : "How many?",
            default : 1
        }]).then(answers=>{
            if(parseInt(answers.add)== NaN || parseInt(answers.add)<=0){
                console.log("wrong input");
                addInventory();
            }else{
                let addId = answers.item.substring(0,answers.item.indexOf("."));
                let addNum = parseInt(answers.add);
                connection.query("update products set stock_quantity = stock_quantity + ? where item_id = ?",[addNum,addId],function(err,data){
                    if (err) {
                        console.log(err);
                        
                    }
                    if(data.affectedRows == 1){
                        console.log("add success");
                        main();
                    }
                })
                
            }
        });
    });
}
function addNewItem(){
    inquirer.prompt([{
        type : "input",
        name : "name",
        message : "Product name?"
    },{
        type : "input",
        name : "department",
        message : "Department?",

    },{
        type : "input",
        name : "price",
        message : "Price?",


    },{
        type : "input",
        name : "quantity",
        message : "How many?"
    }]).then(answers=>{
        //should have more validation
        //don't want to do it 
        if(answers.name != "" && answers.department != "" && answers.price != ""&& answers.quantity != ""){
           //should check data base before insert 
            connection.query("insert into products set ?",{
                product_name : answers.name,
                department_name : answers.department,
                price : answers.price,
                stock_quantity : answers.quantity
            },function(err,data){
                if (err) {
                    console.log(err);
                    
                }
              if (data.affectedRows ==1) {
                  console.log("add item success");
                  main();
              }
               
            });
        }else{
            console.log("wrong input");
            addNewItem();
        }
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
                break;
            case "Add to Inventory":
                addInventory();
                break;
            case "View Low Inventory":
                viewLowInventory();
                break;
            case "Add New Product":
                addNewItem();
                break;
            default:
                connection.end();
                break;
        }
    });
}
main();