//      RPC Websocket
//      Written by Erik Poupaert, Cambodia
//      (c) 2014
//      Licensed under the LGPL

var EventEmitter = require('eventemitter2').EventEmitter2;
var _=require("underscore");
var par = require('par');

/**
 * Constructor. Wraps a websocket object.
 * @param {object} webSocket The websocket object to wrap.
 */
function RpcSocket(ws) {

        this.webSocket=ws;
        this.currentMsgid=1;

        this.events=['open','close','error',
                        'beforeSend','afterSend',
                        'beforeReceive','afterReceive'];

        var rpcReply=(function(msgid,messageType,data) {
                var data=this.wrapMessage(data,messageType,msgid,'reply');
                this.basicSend(data);

        }).bind(this);

        ws.on('open', (function() {
                this.emit('open');
        }).bind(this));

        ws.on('close', (function() {
                this.emit('close');
        }).bind(this));

        ws.on('error', (function(errObj) {
                this.emit('error',errObj);
        }).bind(this));

        ws.on('message', (function(data) {

                data=JSON.parse(data);

                this.emit("beforeReceive",data);

                var userData=this.unWrapMessage(data);

                var event;

                if(!_(data).has('messageType')) {
                        this.emitError('missing messageType');
                        return;
                } else {
                        var event=data['messageType'];
                }

                if(_(data).has('rpc')) {

                        if(!_(data).has('msgid')) {
                                this.emitError('missing msgid');
                                return;
                        }

                        var msgid=data['msgid'];
                        var msgkey='req-'+msgid;

                        switch(data['rpc']) {
                                case 'reply': this.emit(msgkey,userData); 
                                                break;
                                case 'request': var partialFunc=par(rpcReply,msgid,event);
                                                this.emit(event,userData,partialFunc); 
                                                break;
                                default: this.emitError('invalid rpc type',"expected: 'reply' or 'request'"); 
                        }
                                 
                } else {
                        this.emit(event,userData);
                }

                this.emit("afterReceive",data);

        }).bind(this));

}

// Inherits from EventEmitter.
RpcSocket.prototype.__proto__ = EventEmitter.prototype;

RpcSocket.prototype.unWrapMessage=function(data) {
        return data["data"];
};

RpcSocket.prototype.wrapMessage=function(data,messageType,msgid,rpc) {
        var message={};
        message['data']=data;
        message['messageType']=messageType;
        if(msgid) message['msgid']=msgid;
        if(rpc) message['rpc']=rpc;
        return message;
};

RpcSocket.prototype.emitError=function(type,msg,desc) {
        var error=new Error(msg);
        error.type=type;
        if(desc) error.description=desc;
        else error.description = '';
        this.emit('error', error);
};

RpcSocket.prototype.basicSend=function(data) {
        this.emit('beforeSend',data);
        this.webSocket.send(JSON.stringify(data));
        this.emit('afterSend',data);
};


/**
 * Sends a message through a websocket.
 * @param {string} messageType The message's type.
 * @param {any} userData The data to send.
 * @returns {void} nothing.
 */
RpcSocket.prototype.send=function(messageType,userData) {
        var data=this.wrapMessage(userData,messageType);
        this.basicSend(data);
}

/**
 * Makes an RPC call through a websocket.
 * @param {string} messageType The message's type (=function name).
 * @param {any} userData The data to send.
 * @param {function} replyHandler The reply handler to call when the response arrives from the server.
 * @returns {void} nothing.
 */
RpcSocket.prototype.rpc=function(messageType,userData,replyHandler) {
        var data=this.wrapMessage(userData,messageType,this.currentMsgid,'request');
        var msgkey='req-'+this.currentMsgid;
        this.once(msgkey,replyHandler);
        this.currentMsgid++;
        this.basicSend(data);
}

/**
 * Closes the websocket.
 * @returns {void} nothing.
 */
RpcSocket.prototype.close=function() {
        this.removeAllListeners();
        this.webSocket.close();
}

module.exports=RpcSocket;

