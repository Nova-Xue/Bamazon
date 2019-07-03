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
function view(){
var querySQL = "select sales.product_sales,departments.over_head_costs,departments.department_name,departments.department_id,(sales.product_sales-departments.over_head_costs) as total_profit from departments ";
querySQL += "left join "+"(select department_name,sum(product_sales) as product_sales from products group by department_name) as sales ";
querySQL += "on sales.department_name = departments.department_name;"
    connection.query(querySQL,function(err,data){
        if (err) {
            console.log(err);
            
        }
        //create a table to display the data from db
        let newData = [
            ["department_id","department_name","over_head_costs","product_sales","total_profit"]
            
        ];
        for (let index = 0; index < data.length; index++) {
            let row = [];
            row.push(data[index].department_id,data[index].department_name,data[index].over_head_costs,data[index].product_sales,data[index].total_profit);
            newData.push(row);
        }
        console.log(table.table(newData));
        
        main();
    });
}
function addDepartment(){
    inquirer.prompt([{
        type : "input",
        name : "name",
        message: "dp name? "
    },{
        type : "input",
        name : "cost",
        message : "cost?"
    }]).then(answers=>{
        if(answers.name != ""&& answers.cost != ""){
            //should have more validation 
            connection.query("insert into departments set ?",{
                department_name : answers.name,
                over_head_costs : answers.cost
            },function(err,data){
                if (err) {
                    console.log(err);
                    
                }
                if (data.affectedRows ==1) {
                    console.log("add department success");
                    main();
                    
                }
            });
        }else{
            console.log("wrong input");
            addDepartment();
        }
    });
}
function main(){
    inquirer.prompt({
        type : "list",
        name : "option",
        message : "choose an option",
        choices : ["view","add department","quit"]
    }).then(answer=>{
        switch (answer.option) {
            case "view":
                view();
                break;
            case "add department" :
                addDepartment();
                break;
            default:
                connection.end();
                break;
        }
    });
}
main();