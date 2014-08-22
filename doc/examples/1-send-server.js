var engine = require('engine.io');
var server = engine.listen(8081);
var RpcServer=require('../../index.js').server;
var wss=new RpcServer(server);

console.log('server started ...');

wss.on('connection', function(ws) {

    ws.on('test/mtype1', function(message) {
        console.log('received: %s', message);
            ws.send('test/mtype1','something back');
    });

    ws.on('test/mtype2', function(message) {
        console.log('received: %s', message);
            ws.send('test/mtype2','something else back');
    });

});

