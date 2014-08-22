var ws = require('engine.io-client')('ws://localhost:8081');

ws.on('open', function() {
    ws.send('something');
});

ws.on('message', function(data) {
        console.log('received:'+data);
        ws.close();
});

ws.on('close', function() {
        console.log('closing socket');
});

