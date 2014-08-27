//      RPC Websocket
//      Written by Erik Poupaert, Cambodia
//      (c) 2014
//      Licensed under the LGPL

var EventEmitter = require('eventemitter2').EventEmitter2;
var RpcSocket=require('./rpc-socket.js');

/**
 * Constructor. Wraps a websocket server object.
 * @param {object} server The server object to wrap.
 */
function RpcServer(server) {

        this.webSocketServer=server;

        this.webSocketServer.on('connection', (function(socket) {
                        var socket=new RpcSocket(socket);
                        this.emit('connection',socket);
        }).bind(this));
}

// Inherits from EventEmitter.
RpcServer.prototype.__proto__ = EventEmitter.prototype;

/**
 * Closes the server object.
 * @returns nothing.
 */
RpcServer.prototype.close=function() {
        this.removeAllListeners();
        this.webSocketServer.close();
}


module.exports=RpcServer;

