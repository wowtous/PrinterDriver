var express = require('express');
var printer = require("printer");
var request = require("request");
var fs      = require("fs");
var async   = require('async');
var router  = express.Router();

var printerFormat = 'PDF';

router.get('/print',function(req,res){
    var machineID;
    var postData  = req.query;
    var printData;
    var currentJobID;
    //insert machineID
    
    var printerName   = printer.getPrinters()[0].name;

    async.series([
        function(cb){
            fs.readFile('/home/wucho/machineID',function(error,data){
                //step1: read file;
               if(error){
                   cb('readFileError',null);
               }else{
                   machineID=data.toString().replace(/\s/,'').replace(/\n/,"");
                   postData.machineID=machineID;
                   cb(null,null);
               }
            });
        },
        function(cb){
            //step2: read Printer status
            if(printer.getPrinters()[0].status=='IDLE'){
                cb(null,null);
            }else{
                cb('printerNotReadyError',null);
            }
        },
        function(cb){
            //step3: request ticket data
            request.post('http://ticketapi.dd885.com/ticket/verify',{form:postData},function(error,response,body){
            //request.post('http://localhost:3000/ticket/verify',{form:postData},function(error,response,body){
                if(error){
                    cb('httpRequestError',null);
                }else{
                    var result = JSON.parse(body);
                    if(result.error==0){
                        if(result.buffer.data!==undefined && result.buffer.data){
                            printData = result.buffer.data;
                        } else{
                            printData = result.buffer;
                        }
                        cb(null,null);
                    }else{
                        cb('httpRequestResultError',null);
                    }
                }
            });
        },
        function(cb){
            //step4: print ticket
            printer.printDirect({
                data    : new Buffer(printData),
                printer : printerName,
                type    : printerFormat,
                success:function(jobID){
                    currentJobID = jobID;
                    cb(null,null);
                },
                error:function(err){
                    cb('printError',err);
                }
            });

        }
        //,
        //function(cb){
        //    //step5: decide cancel or continue
        //    setTimeout(function(){
        //        var jobInfo = printer.getJob(printerName, currentJobID);
        //        console.log("jobID is: %s,job status is: %s",currentJobID,jobInfo.status);
        //        if(jobInfo.status.indexOf('PRINTED') !== -1){
        //            console.log('print successfully');
        //            cb(null,null);
        //        }else{
        //            var isCancel = printer.setJob(printerName, currentJobID , 'CANCEL');
        //            console.log('is canceled success:%s', isCancel, currentJobID, jobInfo.status);
        //            cb('printJobCancel',isCancel);
        //        }
        //    },5000);
        //}
    ],function(error,result){
        if(error=='readFileError'){
            console.log('errorType:%s,errorMsg:%s',error,result);
            res.jsonp({error:500});
        }else if(error=='printerNotReadyError'){
            console.log('errorType:%s,errorMsg:%s',error,result);
            res.jsonp({error:500});
        }else if(error=='httpRequestError'){
            console.log('errorType:%s,errorMsg:%s',error,result);
            res.jsonp({error:500});
        }else if(error=='httpRequestResultError'){
            console.log('errorType:%s,errorMsg:%s',error,result);
            res.jsonp({error:500});
        }else if(error=='printError'){
            console.log('errorType:%s,errorMsg:%s',error,result);
            res.jsonp({error:500});
        }else if(error=='printJobCancel'){
            console.log('errorType:%s,errorMsg:%s',error,result);
            res.jsonp({error:500});
        }else{
            console.log('errorType:%s,errorMsg:%s',error,result);
            res.jsonp({error:0});
        }
    });

/*

    fs.readFile('/home/wucho/machineID',function(error,data){
        //read machineID from home directory
       if(error){
           res.jsonp({error:500,errorMsg:"machineID cannot read"});
       } else{
           machineID=data.toString().replace(/\s/,'').replace(/\n/,"");
           postData.machineID=machineID;
           request.post('http://ticketapi.dd885.com/ticket/verify',{form:postData},function(error,response,body){
               if(error){
                   console.log('networkerror is : %s',error);
                   res.jsonp({error:500,errorMsg:"networkError"});
               }else{
                   //console.log(body);
                   var result = JSON.parse(body);
                   if(result.error==0){
                       //do print
                       printer.printDirect({
                           data    : new Buffer(result.buffer.data),
                           printer : printerName,
                           type    : printerFormat,
                           success:function(jobID){
                               setTimeout(function(){
                                   var jobInfo = printer.getJob(boca.name, jobID);
                                       if(jobInfo.status.indexOf('PRINTED') !== -1){
                                           console.log('print successfully');
                                           res.jsonp({error:0});
                                       }else{
                                           var isCancel = printer.setJob(boca.name, jobID, 'CANCEL');
                                           console.log('canceled '+isCancel);
                                       }
                               },5000);

                           },
                           error:function(err){
                               // TODO post:/order/ticket/printFail
                               res.jsonp({error:500,errorMsg:"printerError"});
                           }
                       });
                   }else{
                       console.log('query error is:%s',JSON.stringify(result));
                       res.jsonp({error:500,errorMsg:"networkError"});
                   }
               }
           });
       }
    });
*/


});

module.exports = router;
