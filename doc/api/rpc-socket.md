

<!-- Start lib/rpc-socket.js -->

#### RpcSocket(ws)

Constructor. Wraps a websocket object

**Params** 

* **object** *ws* The websocket object to wrap

#### send(MessageType, UserData)

Sends as message through the websocket

**Params** 

* **string** *MessageType* The message's type
* **any** *UserData* The data to send

#### rpc(MessageType, UserData, The)

Makes an RPC call through the websocket

**Params** 

* **string** *MessageType* The message's type
* **any** *UserData* The data to send
* **function** *The* reply handler to call when the response arrives from the server

#### close()

Closes the websocket

<!-- End lib/rpc-socket.js -->

