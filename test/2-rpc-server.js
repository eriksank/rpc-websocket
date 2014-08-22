describe.skip('rpc', function(){

        var engine = require('engine.io');
        var server = engine.listen(8082);
        var RpcServer=require('../index.js').server;
        var wss=new RpcServer(server);

        wss.on('connection', function(ws) {

                ws.on('test-type1', function(message,reply) {
                        reply('TEST-BACK-1-'+message);
                });

                ws.on('test-type2', function(message,reply) {
                        reply('TEST-BACK-2'+message);
                });

                ws.on('test-type3', function(message,reply) {
                        reply('TEST-BACK-3'+message);
                });

        });

});
