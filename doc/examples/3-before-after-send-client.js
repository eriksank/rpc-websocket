var ioSocket = require('engine.io-client')('ws://localhost:8081');
var RpcSocket=require('../../index.js');
var ws=new RpcSocket(ioSocket);

ws.on('open', function() {
    ws.send('test-type','something');
});

ws.on('test-type', function(data) {
        console.log(data);
});

ws.on('beforeSend',function(data) {
        data['data']='changed before sending';
        console.log('before sending:'+JSON.stringify(data));
});

ws.on('afterSend',function(data) {
        console.log('after sending:'+JSON.stringify(data));
});

ws.on('beforeReceive',function(data) {
        console.log('before receiving:'+JSON.stringify(data));
});

ws.on('afterReceive',function(data) {
        console.log('after receiving:'+JSON.stringify(data));
        ws.close();
});

