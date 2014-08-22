var ioSocket = require('engine.io-client')('ws://localhost:8081');
var RpcSocket=require('../../index.js');
var ws=new RpcSocket(ioSocket);

ws.on('open', function() {

    ws.rpc('test-type','something',function(message){
        console.log('received the following reply:'+message);
        ws.close();
    });

});

