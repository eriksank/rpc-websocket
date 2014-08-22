/*
        RPC Websocket
        Written by Erik Poupaert, Cambodia
        (c) 2014
        Licensed under the LGPL
*/

/** 
 * Module to wrap you websocket server object in order to give it RPC capabilities.
 * @module rpc-websocket/RpcServer
 */

var EventEmitter = require('events').EventEmitter;
var RpcSocket=require('./rpc-socket.js');

/**
 * @constructor Wraps a websocket server object
 * @param {object} server The server object to wrap
 */
function RpcServer(server) {

        this.server=server;

        this.server.on('connection', (function(socket) {
                        var socket=new RpcSocket(socket);
                        this.emit('connection',socket);
        }).bind(this));
}

// Inherits from EventEmitter.
RpcServer.prototype.__proto__ = EventEmitter.prototype;

/**
 * Closes the server object.
 * @returns nothing
 */
RpcServer.prototype.close=function() {
        this.removeAllListeners();
        this.server.close();
}


module.exports=RpcServer;

