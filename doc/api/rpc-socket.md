

<!-- Start lib/rpc-socket.js -->

#### RpcSocket(webSocket)

Constructor. Wraps a websocket object.

_Params_ 

* **object** *webSocket* The websocket object to wrap.

#### send(messageType, userData)

Sends a message through a websocket.

_Params_ 

* **string** *messageType* The message's type.
* **any** *userData* The data to send.

#### rpc(messageType, userData, replyHandler)

Makes an RPC call through a websocket.

_Params_ 

* **string** *messageType* The message's type (=function name).
* **any** *userData* The data to send.
* **function** *replyHandler* The reply handler to call when the response arrives from the server.

#### close()

Closes the websocket.

<!-- End lib/rpc-socket.js -->

