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
                    console.log("add success");
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