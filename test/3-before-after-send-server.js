describe.skip('send', function(){
        var engine = require('engine.io');
        var server = engine.listen(8081);
        var RpcServer=require('../index.js').server;
        var wss=new RpcServer(server);

        //server sending/receiving
        wss.on('connection', function(serverws) {

            serverws.on('type1', function(message) {
                serverws.send('type1','TEST-BACK-1');
            });

            serverws.on('type2', function(message) {
                serverws.send('type2','TEST-BACK-2');
            });

            serverws.on('type3', function(message) {
                serverws.send('type3','TEST-BACK-3');
            });

        });
});
