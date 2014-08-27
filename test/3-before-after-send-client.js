var assert=require('assert');
var ChildProcess=require('child_process');

describe('before/after send/receive', function(){
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
                var beforeReceiveCount=0;
                var afterReceiveCount=0;

                var MESSAGES_PER_TYPE=50;
                var MAX_MESSAGES=2*MESSAGES_PER_TYPE;

                //current message
                var currentMessage="";

                //client sending
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

                //client receiving
                clientws.on('beforeReceive', function(data) {
                        //XXX still need to figure out how to compare this to the
                        // total number of messages ...
                        beforeReceiveCount++;
                });

                clientws.on('afterReceive', function(data) {
                        //XXX still need to figure out how to compare this to the
                        // total number of messages ...
                        afterReceiveCount++;
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

