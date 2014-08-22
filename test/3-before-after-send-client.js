var assert=require('assert');
var ChildProcess=require('child_process');

describe('send', function(){
        it('should receive an event before/after sending', function(){

                //start test server
                var child=ChildProcess.exec('./test/3-before-after-send-server.js');

                //arrange for a client
                var ioSocket = require('engine.io-client')('ws://localhost:8081');
                var RpcSocket=require('../index.js');
                var clientws=new RpcSocket(ioSocket);

                //count messages
                var sentCount=0;
                var beforeSendCount=0;
                var afterSendCount=0;

                var MESSAGES_PER_TYPE=50;
                var MAX_MESSAGES=2*MESSAGES_PER_TYPE;

                //current message
                var currentMessage="";

                //client sending/receiving
                clientws.on('open', function() {
                        for(var i=0; i<MESSAGES_PER_TYPE; i++) {
                                currentMessage='TEST-FORTH-1';
                                clientws.send('type1',currentMessage);
                                sentCount++;
                                currentMessage='TEST-FORTH-2';
                                clientws.send('type2',currentMessage);
                                sentCount++;
                        }

                        assert.equal(sentCount,beforeSendCount);
                        assert.equal(sentCount,afterSendCount);

                });

                //before/after send
                clientws.on('beforeSend',function(data) {
                        assert.equal(currentMessage,data['data']);
                        beforeSendCount++;
                });

                clientws.on('afterSend',function(data) {
                        assert.equal(currentMessage,data['data']);
                        afterSendCount++;
                });

        

        });

});

