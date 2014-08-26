

<!-- Start lib/rpc-socket.js -->

#### RpcSocket(ws)

Constructor. Wraps a websocket object.

_Params_ 

* **object** *ws* The websocket object to wrap.

#### send(MessageType, UserData)

Sends a message through a websocket.

_Params_ 

* **string** *MessageType* The message's type.
* **any** *UserData* The data to send.

#### rpc(MessageType, UserData, ReplyHandler)

Makes an RPC call through a websocket.

_Params_ 

* **string** *MessageType* The message's type (=function name).
* **any** *UserData* The data to send.
* **function** *ReplyHandler* The reply handler to call when the response arrives from the server.

#### close()

Closes the websocket.

<!-- End lib/rpc-socket.js -->

