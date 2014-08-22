var engine = require('engine.io');
var server = engine.listen(8081);

console.log('server started ...');

server.on('connection', function(ws){
        ws.on('message', function(message) {
                console.log('received: %s', message);
                ws.send('back:'+message);
        });
});

