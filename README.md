#RPC WebSocket

1\.  [Synopsis](#synopsis)  
2\.  [Preamble](#preamble)  
2.1\.  [The short story](#theshortstory)  
2.2\.  [Definitions](#definitions)  
3\.  [Installation](#installation)  
4\.  [Browser support](#browsersupport)  
5\.  [Examples](#examples)  
5.1\.  [Running the examples](#runningtheexamples)  
5.2\.  [Example 1](#example1)  
5.3\.  [Example 2](#example2)  
5.4\.  [Example 3](#example3)  
5.5\.  [Example 4](#example4)  
6\.  [Events supported](#eventssupported)  
6.1\.  [Server](#server)  
6.2\.  [Socket](#socket)  
7\.  [API](#api)  
7.1\.  [Socket](#socket-1)  
7.1.1\.  [RpcSocket(webSocket)](#rpcsocketwebsocket)  
7.1.2\.  [send(messageType, userData)](#sendmessagetypeuserdata)  
7.1.3\.  [rpc(messageType, userData, replyHandler)](#rpcmessagetypeuserdatareplyhandler)  
7.1.4\.  [close()](#close)  
7.2\.  [Server](#server-1)  
7.2.1\.  [RpcServer(server)](#rpcserverserver)  
7.2.2\.  [close()](#close-1)  
8\.  [Development tools](#developmenttools)  
9\.  [Building](#building)  
10\.  [Testing](#testing)  
11\.  [Why RPC Socket](#whyrpcsocket)  
11.1\.  [What is wrong with ajax](#whatiswrongwithajax)  
11.2\.  [What is wrong with JSON-RPC](#whatiswrongwithjson-rpc)  
11.3\.  [What is wrong with socket.io](#whatiswrongwithsocket.io)  
12\.  [Contact](#contact)  
12.1\.  [Support](#support)  
12.2\.  [Projects](#projects)  
13\.  [Other publications](#otherpublications)  
14\.  [License](#license)  

<a name="synopsis"></a>

##1\. Synopsis
_RPC WebSocket_ is a wrapper for standard websockets that adds support for message types, RPC, and for before/after send/receive events. It is an alternative to ajax, socket.io, and JSON-RPC.
 


<a name="preamble"></a>

##2\. Preamble

<a name="theshortstory"></a>

###2.1\. The short story

Distributed computing allows for distributed lambdas (=functions). If invoking a local function, looks like this:

```javascript
var y=f(x1,x2);

/* do something with y */

```

In that case, the same function invocation, as function doing the computation on a remote server, that is, a Remote Procedure Call (RPC) looks like that:

```javascript
ws.rpc('f',[x1,x2],function(y) {

  /* do something with y */

 });
```

_Rpc WebSocket_ allows you to make remote function calls over a websocket.

<a name="definitions"></a>

###2.2\. Definitions

* *message types*: Each message is always assigned a type. This allows us to transparently route messages to different handler functions.
* *RPC*: This feature implements the ability to call functions on the server using websockets. It is an alternative to ajax and to JSON-RPC.
* *before/after send/receive events*: For the purposes of logging, encryption, and compression, we need the ability to intercept incoming and outgoing messages before they are delivered to their handler functions. Depending on the application, there may be other reasons to apply wholesale changes to each incoming or outgoing message. We could, for example, add validation logic before sending messages.

I have tested _Rpc WebSocket_ with the [engine.io](https://github.com/Automattic/engine.io) and [engine.io-client](https://github.com/Automattic/engine.io-client) transport mechanisms, but you should most likely be able to use alternative websocket implementations.

<a name="installation"></a>

##3\. Installation

You can install _RPC-WebSocket_ with *npm*:

```bash
npm install rpc-websocket
```

If you want to use *engine.io* on the server side as the transport layer, you can install it with *npm*:

```bash
npm install engine.io
```

On the client side you can use *engine.io-client*:

```bash
npm install engine.io-client
```

<a name="browsersupport"></a>

##4\. Browser support
The module comes with a _browserified_ version:

        browser-support/rpc-websocket-bundle.js

And a minimized version thereof:

        browser-support/rpc-websocket-bundle.min.js

You can use _RPC WebSocket_ directly in the browser like this:

```javascript
var webSocket = new WebSocket('ws://html5rocks.websocket.org/echo');
var ws=new RpcSocket(webSocket);
```

In order to support older browsers, you may want to use something like the _engine.io-client_ wrapper for the browser. In older browsers, it will simulate the websocket logic using older transmission mechanisms.

<a name="examples"></a>

##5\. Examples

<a name="runningtheexamples"></a>

### 5.1\. Running the examples

Open two terminals. In order to run example 1, in one terminal, start the server:

```bash
cd myproject/node_modules/rpc-websocket
node doc/examples/1-send-server.js
```
In the other terminal, you can execute the client:

```bash
cd myproject/node_modules/rpc-websocket
node doc/examples/1-send-client.js
```

<a name="example1"></a>

### 5.2\. Example 1

For: _Sending/receiving typed messages_

**Programs**

_The client_

```javascript
var ioSocket = require('engine.io-client')('ws://localhost:8081');
var RpcSocket=require('rpc-websocket');
var ws=new RpcSocket(ioSocket);

ws.on('open', function() {
    ws.send('test/mtype1','something');
    ws.send('test/mtype2','something');
});

ws.on('test/mtype1', function(data) {
        console.log(data);
        ws.close();
});

ws.on('test/mtype2', function(data) {
        console.log(data);
        ws.close();
});

```

_The server_

```javascript
var engine = require('engine.io');
var server = engine.listen(8081);
var RpcServer=require('rpc-websocket').server;
var wss=new RpcServer(server);

console.log('server started ...');

wss.on('connection', function(ws) {

    ws.on('test/mtype1', function(message) {
        console.log('received: %s', message);
            ws.send('test/mtype1','something back');
    });

    ws.on('test/mtype2', function(message) {
        console.log('received: %s', message);
            ws.send('test/mtype2','something else back');
    });

});

```

**Output**

_The client_

        something back

_The server_

        server started ...
        received: something
        received: something

As you can see, you can just resort to a naming convention to create something like a _test_ channel or namespace.

<a name="example2"></a>

### 5.3\. Example 2

For: _Making RPC calls_

You can let the client make RPC calls to the server, but you can also let the server make RPC calls to the client. Server-to-client RPC calls are not possible with ajax. The fact that this is not possible, endlessly complicates the construction of particular types of applications such as real-time chat boxes.

**Programs**

_The client_

```javascript
var ioSocket = require('engine.io-client')('ws://localhost:8081');
var RpcSocket=require('rpc-websocket');
var ws=new RpcSocket(ioSocket);

ws.on('open', function() {

    ws.rpc('test-type','something',function(message){
        console.log('received the following reply:'+message);
        ws.close();
    });

});

```

_The server_

```javascript
var engine = require('engine.io');
var server = engine.listen(8081);
var RpcServer=require('rpc-websocket').server;
var wss=new RpcServer(server);

console.log('server started ...');

wss.on('connection', function(ws) {

    ws.on('test-type', function(message,reply) {
        console.log('received: %s', message);
        reply('something back');
    });

});

```

**Output**

_The client_

        received the following reply:something back

_The server_

        server started ...
        received: something

<a name="example3"></a>

### 5.4\. Example 3

For: _Handling before/after send/receive events_

You can use the `beforeSend` event to make changes to the message that is about to be sent. You can use the `afterSend` event to do some logging, for example, after successfully sending a message. You can also use the `beforeReceive` and `afterReceive` events. Here an example:

**Programs**

_The client_

```javascript
var ioSocket = require('engine.io-client')('ws://localhost:8081');
var RpcSocket=require('rpc-websocket');
var ws=new RpcSocket(ioSocket);

ws.on('open', function() {
    ws.send('test-type','something');
});

ws.on('test-type', function(data) {
        console.log(data);
});

ws.on('beforeSend',function(data) {
        data['data']='changed before sending';
        console.log('before sending:'+JSON.stringify(data));
});

ws.on('afterSend',function(data) {
        console.log('after sending:'+JSON.stringify(data));
});

ws.on('beforeReceive',function(data) {
        console.log('before receiving:'+JSON.stringify(data));
});

ws.on('afterReceive',function(data) {
        console.log('after receiving:'+JSON.stringify(data));
        ws.close();
});

```
_The server_

```javascript
var engine = require('engine.io');
var server = engine.listen(8081);
var RpcServer=require('rpc-websocket').server;
var wss=new RpcServer(server);

console.log('server started ...');

wss.on('connection', function(ws) {
        ws.on('test-type', function(message) {
                console.log('received: %s', message);
        });

        ws.send('test-type','something back');

});


```

**Output**

_The client_

        before sending:{"data":"changed before sending","messageType":"test-type"}
        after sending:{"data":"changed before sending","messageType":"test-type"}
        before receiving:{"data":"something back","messageType":"test-type"}
        something back
        after receiving:{"data":"something back","messageType":"test-type"}

_The server_

        server started ...
        received: changed before sending


<a name="example4"></a>

### 5.5\. Example 4

For: _Looping over RPC calls_

You could easily run into very subtle bugs when you start looping over RPC calls. For example:

```javascript
var assert=require('assert');
var ChildProcess=require('child_process');

describe('rpc', function(){
        it('should be able to send/receive rpc calls', function(){
        
                //start test server
                var child=ChildProcess.exec('./test/2-rpc-server.js');

                //arrange for a client
                var ioSocket = require('engine.io-client')('ws://localhost:8082');
                var RpcSocket=require('rpc-websocket');
                var ws=new RpcSocket(ioSocket);

                //count messages
                var arrivedCount=0;
                var MESSAGES_PER_TYPE=5;
                var MAX_MESSAGES=3*MESSAGES_PER_TYPE;

                function attemptToTerminate() {
                        arrivedCount++;
                        if(arrivedCount===MAX_MESSAGES) 
                                child.kill('SIGKILL');
                }

                //client sending/receiving
                ws.on('open', function() {
                        for(var i=0; i<MESSAGES_PER_TYPE; i++) {

                                (function(i) {
                                        ws.rpc('test-type1',i,function(message){
                                                assert.equal(message,'TEST-BACK-1-'+i);
                                                attemptToTerminate();                                        
                                        });

                                        ws.rpc('test-type2',i,function(message){
                                                assert.equal(message,'TEST-BACK-2-'+i);
                                                attemptToTerminate();                                        
                                        });

                                        ws.rpc('test-type3',i,function(message){
                                                assert.equal(message,'TEST-BACK-3-'+i);
                                                attemptToTerminate();                                        
                                        });
                                })(i);

                        }

                });

        });

});

```

While the program is executing the reply logic, the value of the loop's counter `i` is not what you may think it is. Since the `reply` logic gets executed asynchronously, your socket could be waiting for a while before getting a response. In the meanwhile your loop counter will have moved on.

If you loop over an RPC call, you can generally not count of the fact that the variables that went into the request, are still the same as when you started the RPC call. Therefore, you must make sure to permanently fix their values in an enclosure:

```javascript
while(condition) {

        ws.rpc('f',[x1,x2],function(y) {

                (function(x1,x2) {

                        /* do something with y */

                })(x1,x2);

        });
}
```
When the enclosure function exits, the logic inside of the function will hang on to copies of `x1`, and `x2` inside its function closure, with values as they were at the moment that the program finished executed the function. The technique to create such enclosure function is called [IIFE](http://en.wikipedia.org/wiki/Immediately-invoked_function_expression) (Immediately-invoked function expression).

<a name="eventssupported"></a>

##6\. Events supported

<a name="server"></a>

###6.1\. Server

* `connection`: no arguments

<a name="socket"></a>

###6.2\. Socket

By bubbling the events from the standard websocket transport layer:

* `open`: no arguments
* `close`: no arguments
* `error`: injects a standard javascript error object with `message`, `type`, and `description` fields 

_Rpc Socket_ events:

* `beforeReceive`: injects a network-level `message` argument
* `afterReceive`: injects a network-level `message` argument
* `beforeSend`: injects a network-level `message` argument
* `afterSend`: injects a network-level `message` argument

A network-level message is an object with the following fields: 

* `data` : the user data
* `messageType`: the message type
* `msgid`: in case of an RPC, the message ID
* `rpc`: in case of an RPC, the role of this message in the rpc process: `request` or `reply`

<a name="api"></a>

##7\. API

<a name="socket-1"></a>

### 7.1\. Socket



<!-- Start lib/rpc-socket.js -->

<a name="rpcsocketwebsocket"></a>

#### 7.1.1\. RpcSocket(webSocket)

Constructor. Wraps a websocket object.

_Params_ 

* **object** *webSocket* The websocket object to wrap.

<a name="sendmessagetypeuserdata"></a>

#### 7.1.2\. send(messageType, userData)

Sends a message through a websocket.

_Params_ 

* **string** *messageType* The message's type.
* **any** *userData* The data to send.

<a name="rpcmessagetypeuserdatareplyhandler"></a>

#### 7.1.3\. rpc(messageType, userData, replyHandler)

Makes an RPC call through a websocket.

_Params_ 

* **string** *messageType* The message's type (=function name).
* **any** *userData* The data to send.
* **function** *replyHandler* The reply handler to call when the response arrives from the server.

<a name="close"></a>

#### 7.1.4\. close()

Closes the websocket.

<!-- End lib/rpc-socket.js -->



<a name="server-1"></a>

### 7.2\. Server



<!-- Start lib/rpc-server.js -->

<a name="rpcserverserver"></a>

#### 7.2.1\. RpcServer(server)

Constructor. Wraps a websocket server object.

_Params_ 

* **object** *server* The server object to wrap.

<a name="close-1"></a>

#### 7.2.2\. close()

Closes the server object.

<!-- End lib/rpc-server.js -->


<a name="developmenttools"></a>

##8\. Development tools

* Standard websockets: [engine.io](https://github.com/Automattic/engine.io), [engine.io-client](https://github.com/Automattic/engine.io-client)
* browser support: [browserify](https://github.com/substack/node-browserify), [uglifyjs](https://github.com/mishoo/UglifyJS)
* Unit tests: [mocha](https://github.com/visionmedia/mocha)
* Documentation: [markdox](https://github.com/cbou/markdox), [markdown-pp.py](https://github.com/jreese/markdown-pp)

<a name="building"></a>

## 9\. Building

Execute the `build.sh` script to re-build the project from sources. It will re-generate the browser support files and the documentation.

<a name="testing"></a>

## 10\. Testing

Open a terminal and use _mocha_ to run the unit tests:

```bash
cd node_modules/rpc-websocket
mocha
```

The unit tests work by starting the client who will in turn spawn a server process. The unit tests are mostly complete now.

<a name="whyrpcsocket"></a>

##11\. Why RPC Socket

<a name="whatiswrongwithajax"></a>

### 11.1\. What is wrong with ajax
With nowadays half of the internet hanging together with ajax, it is easy to forget that ajax is just a hack in which we reuse the _http_ protocol to do something that it was not designed for. Ajax is not particularly suitable as an RPC mechanism. But then again, since ajax was the only RPC-like mechanism that browsers until recently supported, ajax is indeed what we have used to build half of the existing internet.

<a name="whatiswrongwithjson-rpc"></a>

### 11.2\. What is wrong with JSON-RPC
[JSON-RPC](http://json-rpc.org/) has made the same mistake as SOAP and XML-RPC. JSON-RPC inspects the messages being sent and forces the developer to conform to a particular arrangement or even to a formal schema.  JSON-RPC adds a bureaucratic procedure at a point in time when most developers would rather remain in prototyping mode. It causes the following reaction: _Get out of my way, because I am too busy for this right now. I've got other things on my mind._

There would be nothing wrong with adding structural validation logic before sending a message, but that is rather something for later on in the project. Furthermore, there are many ways to do that. One size will not fit all. In practice, as you can see from most REST APIs floating around on the web, most applications will simply not implement any formal validation schema system at all.

With *RPC WebSocket*, you can still send whatever you like, just like with standard websockets. It is just a router module that facilitates the delivery of messages to the right handlers inside your program.

<a name="whatiswrongwithsocket.io"></a>

### 11.3\. What is wrong with socket.io
Somewhere in the future, there will probably be nothing wrong with _socket.io_. In this month of August 2014, there were at some point 600+ outstanding, [unresolved issues](https://github.com/Automattic/socket.io/issues). I personally also logged a trouble ticket for something that we can only call a bug, but I have not heard back from their _helpdesk_.

_Socket.io_ supports lots of features on top of websockets, such as support for _express_ and _koa_. They also implements numerous scenarios in which you can use websockets with _namespaces_. You can even join and leave _rooms_. I only needed the _custom events_ (=message types) and _acknowledgements_ (=rpc). In _RPC Socket_ I did not want and did not implement _namespaces_, because you can just prefix your message types with a namespace in order to create separate channels in one websocket.

In *RPC Socket* I did not implement support for _express_ or _koa_. You could as well run the websocket server on another port, or even in another virtual machine, if you are worried about firewalls. Mixing http traffic with websockets in one server process, looks like an excellent way to create an undebuggable monster.

If you combine the _socket.io_ features in unexpected ways, you may be in for a surprise. Just for the hell of it, I tried to use _namespaces_ combined with _acknowledgements_. The entire edifice came crashing down and my trouble ticket is still unanswered. By the way, I did not find any unit tests in the _socket.io_ sources that test for such combination of features. There are many other scenarios possible for using websockets than the ones implemented today in _socket.io_. I wonder, however, are they going to keep adding every possible new scenario? That could only end in a fully-fledged _disasterzilla_ ...

<a name="contact"></a>

## 12\. Contact

<a name="support"></a>

###12.1\. Support
For trouble tickets with _RPC WebSocket_, please, use the github [issue list](https://github.com/eriksank/rpc-websocket/issues).

<a name="projects"></a>

###12.2\. Projects
I am available for commercial projects.

In commercial projects, I often do the initial prototyping by myself. After that, I manage external developer contributions through github and bitbucket. I usually end up being the long-term go-to person for how to evolve the system. My work involves reviewing Javascript for both the web and nodejs. I occasionally still do PHP. The startups I work for, are usually located elsewhere, but I do all of my work from Cambodia. If you are in need of a source code manager or quality assurance person for your project, feel free to contact me at erik@sankuru.biz.

<a name="otherpublications"></a>

##13\. Other publications

* At [github.com](https://github.com/eriksank)
* At [www.npmjs.org](https://www.npmjs.org/~eriksank)

<a name="license"></a>

##14\. License

        RPC Websocket
        Written by Erik Poupaert, Cambodia
        (c) 2014
        Licensed under the LGPL

