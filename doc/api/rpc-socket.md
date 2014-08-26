

<!-- Start lib/rpc-socket.js -->

RPC Websocket
        Written by Erik Poupaert, Cambodia
        (c) 2014
        Licensed under the LGPL

## EventEmitter

Module to wrap you websocket object in order to give it RPC capabilities.

## RpcSocket(ws)

### Params: 

* **object** *ws* The websocket object to wrap

## send(MessageType, UserData)

Sends as message through the websocket

### Params: 

* **string** *MessageType* The message's type
* **any** *UserData* The data to send

## rpc(MessageType, UserData, The)

Makes an RPC call through the websocket

### Params: 

* **string** *MessageType* The message's type
* **any** *UserData* The data to send
* **function** *The* reply handler to call when the response arrives from the server

## close()

Closes the websocket

<!-- End lib/rpc-socket.js -->

