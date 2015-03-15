var printer = require("printer");
var fs = require('fs');

var printerList = printer.getPrinters();

//console.log(printerList);




//fs.readFile('/home/wucho/f302686bff903dabd242d8cb.pdf',function(error,data){
//    printer.printDirect({
//        data    : data,
//        printer : boca.name,
//        type    : 'PDF',
//        success:function(jobID){
//
//        },
//        error:function(err){
//
//        }
//    });
//});

//printer.printDirect({
//    data    : 'a',
//    printer : printerList[0].name,
//    type    : 'TEXT',
//    success:function(jobID){
//
//    },
//    error:function(err){
//
//    }
//});


//var jobInfo = printer.getJob(printerList[0].name, 142);
//console.log(printer.setJob(printerList[0].name, 152 , 'CANCEL'));

var boca = printerList[0];

console.log(boca);