var assert=require('assert');
var ChildProcess=require('child_process');

describe('send', function(){
        it('should be able to send/receive typed messages', function(){

                //start test server
                var child=ChildProcess.exec('./test/1-send-server.js');

                //arrange for a client
                var ioSocket = require('engine.io-client')('ws://localhost:8081');
                var RpcSocket=require('../index.js');
                var clientws=new RpcSocket(ioSocket);

                //count messages
                var arrivedCount=0;
                var MESSAGES_PER_TYPE=50;
                var MAX_MESSAGES=3*MESSAGES_PER_TYPE;

                function attemptToTerminate() {
                        arrivedCount++;
                        if(arrivedCount===MAX_MESSAGES) 
                                child.kill('SIGKILL');
                }

                //client sending/receiving
                clientws.on('open', function() {
                        for(var i=0; i<MESSAGES_PER_TYPE; i++) {
                            clientws.send('type1','TEST-FORTH-1');
                            clientws.send('type2','TEST-FORTH-2');
                        }
                });

                clientws.on('type1', function(message) {
                        assert.equal(message,'TEST-BACK-1');
                        attemptToTerminate();
                });

                clientws.on('type2', function(message) {
                        assert.equal(message,'TEST-BACK-2');
                        attemptToTerminate();
                });

                clientws.on('type3', function(message) {
                        assert.equal(message,'TEST-BACK-3');
                        attemptToTerminate();
                });

        });

});

