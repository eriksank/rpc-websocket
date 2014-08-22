var engine = require('engine.io');
var server = engine.listen(8081);
var RpcServer=require('../../index.js').server;
var wss=new RpcServer(server);

console.log('server started ...');

wss.on('connection', function(ws) {

    ws.on('test-type', function(message,reply) {
        console.log('received: %s', message);
        reply('something back');
    });

});

