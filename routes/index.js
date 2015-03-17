var express = require('express');
var printer = require("printer");
var request = require("request");
var fs = require("fs");
var async = require('async');
var router = express.Router();

var printerFormat = 'PDF';
var machineIDFile = '/home/wucho/machineID';
var debug = false;
var isAppReady = false;
setTimeout(function(){ isAppReady = true; }, 15 * 1000);

router.get('/print', function (req, res) {
    var postData = req.query;
    var errorData = {
        'orderID': postData.orderID,
        'mobile': postData.mobile,
        'machineID': '',
        'errorInfo': '',
        'res': {
            'error': -1,
            'errorMsg': ''
        }
    };

    if (isAppReady) {
        var machineID;
        var printData;
        var currentJobID;
        //insert machineID

        var printerName = printer.getPrinters()[0].name;

        async.series([
            function (cb) {
                fs.readFile(machineIDFile, function (error, data) {
                    //step1: read file;
                    if (error) {
                        errorData.errorInfo = 'readFileError';
                        cb(errorData, null);
                    } else {
                        machineID = data.toString().replace(/\s/, '').replace(/\n/, "");
                        postData.machineID = machineID;
                        errorData.machineID = machineID;
                        cb(null, null);
                    }
                });
            },
            function (cb) {
                //step2: read Printer status
                if (printer.getPrinters()[0].status == 'IDLE') {
                    cb(null, null);
                } else {
                    errorData.errorInfo = 'printerNotReadyError';
                    cb(errorData, null);
                }
            },
            function (cb) {
                //step3: request ticket data
                //request.post('http://localhost:3000/ticket/verify', {form: postData}, function (error, response, body) {
                request.post('http://ticketapi.dd885.com/ticket/verify',{form:postData},function(error,response,body){
                    if (error) {
                        errorData.errorInfo = 'httpRequestError';
                        errorData.res.errorMsg = '订单信息请求失败';
                        cb(errorData, null);
                    } else {
                        var result = JSON.parse(body);
                        if (result.error == 0) {
                            if (result.buffer.data !== undefined && result.buffer.data) {
                                printData = result.buffer.data;
                            } else {
                                printData = result.buffer;
                            }
                            cb(null, null);
                        } else {
                            errorData.errorInfo = 'httpRequestResultError';
                            errorData.res.error = result.error;
                            errorData.res.errorMsg = result.errorMsg;
                            cb(errorData, null);
                        }
                    }
                });
            },
            function (cb) {
                //step4: print ticket
                printer.printDirect({
                    data: new Buffer(printData),
                    printer: printerName,
                    type: printerFormat,
                    success: function (jobID) {
                        currentJobID = jobID;
                        cb(null, null);
                    },
                    error: function (err) {
                        errorData.errorInfo = 'printError';
                        cb(errorData, null);
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
        ], function (error, result) {
            if (error.errorInfo == 'readFileError') {
                if (debug) { console.log('errorType:%s,errorMsg:%s', error, result); }
                error.error = 700;
                res.jsonp(error);
            } else if (error.errorInfo == 'printerNotReadyError') {
                if (debug) { console.log('errorType:%s,errorMsg:%s', error, result); }
                error.error = 701;
                res.jsonp(error);
            } else if (error.errorInfo == 'httpRequestError') {
                if (debug) { console.log('errorType:%s,errorMsg:%s', error, result); }
                error.error = 702;
                res.jsonp(error);
            } else if (error.errorInfo == 'httpRequestResultError') {
                if (debug) { console.log('errorType:%s,errorMsg:%s', error, result); }
                error.error = 703;
                res.jsonp(error);
            } else if (error.errorInfo == 'printError') {
                if (debug) { console.log('errorType:%s,errorMsg:%s', error, result); }
                error.error = 704;
                res.jsonp(error);
            } else if (error.errorInfo == 'printJobCancel') {
                if (debug) { console.log('errorType:%s,errorMsg:%s', error, result); }
                error.error = 705;
                res.jsonp(error);
            } else {
                res.jsonp({error: 0});
            }
        });


        /*fs.readFile('/home/wucho/machineID', function (error, data) {
            //read machineID from home directory
            if (error) {
                res.jsonp({error: 500, errorMsg: "machineID cannot read"});
            } else {
                machineID = data.toString().replace(/\s/, '').replace(/\n/, "");
                postData.machineID = machineID;
                request.post('http://ticketapi.dd885.com/ticket/verify', {form: postData}, function (error, response, body) {
                    if (error) {
                        console.log('networkerror is : %s', error);
                        res.jsonp({error: 500, errorMsg: "networkError"});
                    } else {
                        //console.log(body);
                        var result = JSON.parse(body);
                        if (result.error == 0) {
                            //do print
                            printer.printDirect({
                                data: new Buffer(result.buffer.data),
                                printer: printerName,
                                type: printerFormat,
                                success: function (jobID) {
                                    setTimeout(function () {
                                        var jobInfo = printer.getJob(boca.name, jobID);
                                        if (jobInfo.status.indexOf('PRINTED') !== -1) {
                                            console.log('print successfully');
                                            res.jsonp({error: 0});
                                        } else {
                                            var isCancel = printer.setJob(boca.name, jobID, 'CANCEL');
                                            console.log('canceled ' + isCancel);
                                        }
                                    }, 5000);

                                },
                                error: function (err) {
                                    // TODO post:/order/ticket/printFail
                                    res.jsonp({error: 500, errorMsg: "printerError"});
                                }
                            });
                        } else {
                            console.log('query error is:%s', JSON.stringify(result));
                            res.jsonp({error: 500, errorMsg: "networkError"});
                        }
                    }
                });
            }
        });*/
    } else {
        errorData.error=703;
        errorData.res.error=699;
        errorData.res.errorMsg='应用程序正在准备中，请稍后再试...';
        res.jsonp(errorData);
    }
});

module.exports = router;
