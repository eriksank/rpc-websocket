var assert=require('assert');
var ChildProcess=require('child_process');

describe('rpc', function(){
        it('should be able to send/receive rpc calls', function(){
        
                //start test server
                var child=ChildProcess.exec('./test/2-rpc-server.js');

                //arrange for a client
                var ioSocket = require('engine.io-client')('ws://localhost:8082');
                var RpcSocket=require('../index.js');
                var ws=new RpcSocket(ioSocket);

                //count messages
                var arrivedCount=0;
                var MESSAGES_PER_TYPE=5;
                var MAX_MESSAGES=3*MESSAGES_PER_TYPE;

                function attemptToTerminate() {
                        arrivedCount++;
                        if(arrivedCount===MAX_MESSAGES) 
                                child.kill('SIGKILL');
                }

                //client sending/receiving
                ws.on('open', function() {
                        for(var i=0; i<MESSAGES_PER_TYPE; i++) {

                                (function(i) {
                                        ws.rpc('test-type1',i,function(message){
                                                assert.equal(message,'TEST-BACK-1-'+i);
                                                attemptToTerminate();                                        
                                        });

                                        ws.rpc('test-type2',i,function(message){
                                                assert.equal(message,'TEST-BACK-2-'+i);
                                                attemptToTerminate();                                        
                                        });

                                        ws.rpc('test-type3',i,function(message){
                                                assert.equal(message,'TEST-BACK-3-'+i);
                                                attemptToTerminate();                                        
                                        });
                                })(i);

                        }

                });

        });

});

