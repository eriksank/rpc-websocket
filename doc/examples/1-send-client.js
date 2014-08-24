var ioSocket = require('engine.io-client')('ws://localhost:8081');
var NaclSocket=require('../../index.js');
var ws=new NaClSocket(ioSocket);

ws.on('open', function() {
    ws.send('test/mtype1','something');
    ws.send('test/mtype2','something');
});

ws.on('test/mtype1', function(data) {
        console.log(data);
        ws.close();
});

ws.on('test/mtype2', function(data) {
        console.log(data);
        ws.close();
});

