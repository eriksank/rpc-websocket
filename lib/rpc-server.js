//      RPC Websocket
//      Written by Erik Poupaert, Cambodia
//      (c) 2014
//      Licensed under the LGPL

var EventEmitter = require('eventemitter4');
var RpcSocket=require('./rpc-socket.js');
var _=require('underscore');

/**
 * Constructor. Wraps a websocket server object.
 * @param {object} server The server object to wrap.
 */
function RpcServer(server) {

        if (!(this instanceof RpcServer))
                throw "this function must be called with the new operator";

        this.init(server);        
}

//extend RpcServer with EventEmitter
_.extend(RpcServer.prototype,EventEmitter.prototype);
//Keep track of the parentInit function
RpcServer.prototype.parentInit=EventEmitter.prototype.init;

RpcServer.prototype.init=function(server) {

        this.parentInit();

        this.webSocketServer=server;

        this.webSocketServer.on('connection', (function(socket) {
                        var socket=new RpcSocket(socket);
                        this.emit('connection',socket);
        }).bind(this));

}

/**
 * Closes the server object.
 * @returns nothing.
 */
RpcServer.prototype.close=function() {
        this.removeAllListeners();
        this.webSocketServer.close();
}


module.exports=RpcServer;

