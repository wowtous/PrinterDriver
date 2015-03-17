var printer = require("printer");
var fs = require('fs');

var printerList = printer.getPrinters();

console.log(printerList);

var boca = printerList[0];

if(boca.status == 'STOPPED'){
    console.log('no printer');
}else{
    fs.readFile('/home/wucho/ticket.pdf',function(error,data){
        printer.printDirect({
            data    : data,
            printer : boca.name,
            type    : 'PDF',
            success:function(jobID){
                //setTimeout(function(){
                //    var jobInfo = printer.getJob(boca.name, jobID);
                //    console.log(JSON.stringify(jobInfo));
                //    if(jobInfo.status.indexOf('PRINTED') !== -1){
                //        console.log('print successfully');
                //    }else{
                //        var isCancel = printer.setJob(boca.name, jobID, 'CANCEL');
                //        console.log('canceled '+isCancel);
                //    }
                //},5000);


                //setTimeout(function(){
                //    var jobs = printer.getPrinters()[0].jobs;
                //    if(jobs.length>0){
                //
                //        console.log('print fail');
                //    }
                //},5000);
            },
            error:function(err){
                // TODO post:/order/ticket/printFail
                //res.jsonp({error:500,errorMsg:"printerError"});
                console.log(err);
            }
        });
    });
    //1f302686bff903dabd242d8cb
}