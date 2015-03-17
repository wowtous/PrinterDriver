var isapp =false;

setTimeout(function(){
    isapp = true;
},5000);

console.log("ajgakgak");


console.log(isapp);

setTimeout(function(){
    if(isapp){
        console.log("-----------");
    };
},5000);