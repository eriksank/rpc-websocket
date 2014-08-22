var engine = require('engine.io');
var server = engine.listen(8081);
var RpcSocket=require('../../index.js');
var wss=new RpcServer(server);

console.log('server started ...');

wss.on('connection', function(ws) {
        ws.on('test-type', function(message) {
                console.log('received: %s', message);
        });

        ws.on('beforeSend',function(data) {
                data['data']='sending back something changed before sending';
                console.log('before sending:'+JSON.stringify(data));
        });

        ws.on('afterSend',function(data) {
                console.log('after sending:'+JSON.stringify(data));
        });

        ws.send('test-type','something back');

});


