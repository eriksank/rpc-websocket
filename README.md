#RPC WebSocket

1\.  [Synopsis](#synopsis)  
2\.  [Preamble](#preamble)  
3\.  [Installation](#installation)  
4\.  [Browser support](#browsersupport)  
5\.  [Examples](#examples)  
5.1\.  [Running the examples](#runningtheexamples)  
5.2\.  [Sending/receiving typed messages](#sending/receivingtypedmessages)  
5.3\.  [Making RPC calls](#makingrpccalls)  
5.4\.  [Handling beforeSend/afterSend events](#handlingbeforesend/aftersendevents)  
5.5\.  [Caveat: watch out for looping over rpc calls](#caveat:watchoutforloopingoverrpccalls)  
6\.  [API](#api)  
6.1\.  [Client](#client)  
6.2\.  [Server](#server)  
7\.  [Why RPC Socket?](#whyrpcsocket?)  
7.1\.  [What is wrong with ajax?](#whatiswrongwithajax?)  
7.2\.  [What is wrong with json-rpc?](#whatiswrongwithjson-rpc?)  
7.3\.  [What is wrong with socket.io?](#whatiswrongwithsocket.io?)  
8\.  [Development](#development)  
9\.  [building](#building)  
10\.  [Other publications](#otherpublications)  
11\.  [Contact](#contact)  
11.1\.  [Support](#support)  
11.2\.  [Projects](#projects)  
12\.  [License](#license)  


<a name="synopsis"></a>

##1\. Synopsis
The RPC WebSocket nodejs module wraps standard websockets in order to add three features: message types, RPC, and before/afterSend events.

<a name="preamble"></a>

##2\. Preamble
* **message types**: Each message is always assigned a type. This allows us to transparently route messages to different handler functions.
* **RPC**: RPC stands Remote Procedure Call. this feature implements the ability to call functions on the server using websockets. It is an alternative to ajax and to json-rpc.
* **before/after send events**: For the purposes of logging, encryption, compression, we need the ability to intercept incoming and outgoing messages before they are delivered to their handler functions. Depending on the application, there may be other reasons to apply wholesale changes to each incoming or outgoing message. We could, for example, add validation logic before sending messages.

I have tested the module with sockets from [engine.io](https://github.com/Automattic/engine.io) and [engine.io-client](https://github.com/Automattic/engine.io-client) but you should most likely be able to use alternative websocket implementations.

<a name="installation"></a>

##3\. Installation
```bash
npm install rpc-websocket
```

<a name="browsersupport"></a>

##4\. Browser support
The module comes with a browserified version:

        browser-support/bundle.js

And a minimized version thereof:

        browser-support/bundle.min.js

You can use RPC WebSocket directly in the browser like this:

```javascript
var webSocket = new WebSocket('ws://html5rocks.websocket.org/echo');
var ws=new RpcSocket(webSocket);
```

In order to support older browsers, you may want to use something like the `engine.io-client` wrapper for the browser. In older browsers, it will simulate the websocket logic using older transmission mechanisms.

<a name="examples"></a>

##5\. Examples

<a name="runningtheexamples"></a>

### 5.1\. Running the examples

Open two terminals. In one terminal, start the server:

```bash
        $ cd myproject/node_modules/rpc-websocket
        $ node doc/examples/1-send-server.js
```
In the other terminal, execute the client:

```bash
        $ cd myproject/node_modules/rpc-websocket
        $ node doc/examples/1-send-client.js
```

<a name="sending/receivingtypedmessages"></a>

### 5.2\. Sending/receiving typed messages

The client:

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


The server:

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


As you can see, you can just resort to a naming convention to create something like a __test__ channel.

<a name="makingrpccalls"></a>

### 5.3\. Making RPC calls

You can let the client make RPC calls to the server, but also the other way around. The other way around is not possible with ajax. This endlessly complicates the construction of particular types of applications such as real-time chat boxes. Websockets are a solution for that.

The client:

var ioSocket = require('engine.io-client')('ws://localhost:8081');
var RpcSocket=require('rpc-websocket');
var ws=new RpcSocket(ioSocket);

ws.on('open', function() {

    ws.rpc('test-type','something',function(message){
        console.log('received the following reply:'+message);
        ws.close();
    });

});


The server:

var engine = require('engine.io');
var server = engine.listen(8081);
var RpcSocket=require('rpc-websocket');
var wss=new RpcServer(server);

console.log('server started ...');

wss.on('connection', function(ws) {

    ws.on('test-type', function(message,reply) {
        console.log('received: %s', message);
        reply('something back');
    });

});



As you can see, this truly allows for distributed lambdas (=functions). If invoking a local function, looks like this:

```javascript
var y=f(x1,x2);

/* do something with y */

```

In that case, invoking a remote function, looks like that:

```javascript
ws.rpc('f',[x1,x2],function(y) {

        /* do something with y */

});

```
It would, of course, be possible to go the same route as _CORBA_ and generate the underlying code from an IDL. Nobody ever felt the urge to do that for ajax, though. Therefore, I suspect there is simply no demand for this type of IDL compilers and for hiding the code behind such IDL specification file that may not even look simpler in the first place.

<a name="handlingbeforesend/aftersendevents"></a>

### 5.4\. Handling beforeSend/afterSend events

You can use the `beforeSend` event to change something to the message about to be sent. You can `afterSend` event to, for example, do some logging, after successfully sending the message:


var ioSocket = require('engine.io-client')('ws://localhost:8081');
var RpcSocket=require('rpc-websocket');
var ws=new RpcSocket(ioSocket);

ws.on('open', function() {
    ws.send('test-type','something');
});

ws.on('test-type', function(data) {
        console.log(data);
        ws.close();
});

ws.on('beforeSend',function(data) {
        data['data']='changed before sending';
        console.log('before sending:'+JSON.stringify(data));
});

ws.on('afterSend',function(data) {
        console.log('after sending:'+JSON.stringify(data));
});


<a name="caveat:watchoutforloopingoverrpccalls"></a>

### 5.5\. Caveat: watch out for looping over rpc calls

You could easily run into very subtle bugs when you start looping over rpc calls. Example:

//arrange for a server

describe.skip('rpc', function(){

        var engine = require('engine.io');
        var server = engine.listen(8082);
        var RpcServer=require('rpc-websocket').server;
        var wss=new RpcServer(server);

        wss.on('connection', function(ws) {

                ws.on('test-type1', function(message,reply) {
                        reply('TEST-BACK-1-'+message);
                });

                ws.on('test-type2', function(message,reply) {
                        reply('TEST-BACK-2'+message);
                });

                ws.on('test-type3', function(message,reply) {
                        reply('TEST-BACK-3'+message);
                });

        });

});

While the program is executing the reply logic, the value of the loop's counter `i` is not what may think it is. The reply logic gets executed asynchronously. Your socket could be waiting for a while before getting a response. In the meanwhile your loop's counter will have moved on.

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
When the enclosure function exits, the logic inside of the function will hang on to copies of __x1__, __x2__ inside its closure, with values as they were at the moment that the program executed the function and left the function. The technique to create such enclosure function is generally called [IIFE](http://en.wikipedia.org/wiki/Immediately-invoked_function_expression) (Immediately-invoked function expression).

<a name="api"></a>

##6\. API

<a name="client"></a>

### 6.1\. Client

!INCLUDE doc/api/rpc-client.md

<a name="server"></a>

### 6.2\. Server

!INCLUDE doc/api/rpc-server.md

<a name="whyrpcsocket?"></a>

##7\. Why RPC Socket?

<a name="whatiswrongwithajax?"></a>

### 7.1\. What is wrong with ajax?
With half of the internet nowadays hanging together through ajax, it is easy to forget that ajax is just a hack in which we reuse the http protocol to do something that it wasn't designed to do. It is not particularly suitable as an RPC mechanism, but since ajax is all we had until recently, that is indeed what we used to build half of the existing internet.

<a name="whatiswrongwithjson-rpc?"></a>

### 7.2\. What is wrong with json-rpc?
[json-rpc](http://json-rpc.org/) has made the same mistake as SOAP and XML-RPC. JSON-RPC inspects the messages being sent and forces the developer to conform to a particular arrangement or even to formal schema.  At the same time, it tends to create an intricate bureaucratic procedure at a point at which most developers would rather be in prototyping mode. So, while prototyping the initial versions of an application, json-rpc gives us the impression: __Get out of my way, because now I am too busy for this, and I've got other things on my mind.__

There would be nothing wrong with adding structural validation logic before sending a message, later on, but there are many ways to do that. One size will not fit all. Furthermore, in practice, as you can see from most REST APIs floating around on the web, most applications will simply not implement any formal validation schema system at all.

With RPC WebSocket, you can still send whatever you like as messages, just like with standard websockets. It is just a router module that facilitates delivering messages to the right handlers inside your program.

<a name="whatiswrongwithsocket.io?"></a>

### 7.3\. What is wrong with socket.io?
Somewhere in the future, there will probably be nothing wrong with socket.io. Today, in August 2014, there were at some point [600+ outstanding, unresolved issues](https://github.com/Automattic/socket.io/issues). I personally also logged a trouble ticket for something that we can only call a bug, but I have not heard back from their __helpdesk__.

Socket.io supports lots of features on top of websockets: such as support for __express__ and __koa__. They also implements numerous scenarios in which you can use websockets with __namespaces__ and in which you can join and leave __rooms__. I only needed the __custom events__ (=message types) and __acknowledgements__ (=rpc). I did not want or implement __namespaces__, because you can just prefix your message types with a namespace in order to create separate channels in one websocket. Life is already full enough of useless complications.

I did not implement support for __express__ or __koa__ because you could as well run the websocket server on another port or in another virtual machine, if you are worried about firewalls. Mixing http with websocket traffic in one server process, looks like an excellent way to create an undebuggable monster.

If you combine the socket.io features in unexpected ways, you may be in for a surprise. Just for the hell of it, I tried to use __namespaces__ combined with __acknowledgements__. The entire edifice came crashing down. My trouble ticket is still unanswered. By the way, I did not find any unit tests in the socket.io sources that test for such combination of features. By the way, there are many other scenarios possible for using websocket than the ones implemented today in socket.io. I wonder, are they going to keep adding these too? That could only end in a fully-fledged __disasterzilla__ ...

<a name="development"></a>

##8\. Development

**Standard websockets:** [engine.io](https://github.com/Automattic/engine.io), [engine.io-client](https://github.com/Automattic/engine.io-client)
**browser support:** [browserify](https://github.com/substack/node-browserify), [uglifyjs](https://github.com/mishoo/UglifyJS)
**Unit tests**: [mocha](https://github.com/visionmedia/mocha)
**Documentation**: [jsdoc2md](https://github.com/75lb/jsdoc-to-markdown), [markdown-pp.py](https://github.com/jreese/markdown-pp)


<a name="building"></a>

## 9\. building

Execute the `build.sh` script to re-build the project from sources.

<a name="otherpublications"></a>

##10\. Other publications

* At [github.com](https://github.com/eriksank)
* At [www.npmjs.org](https://www.npmjs.org/~eriksank)

<a name="contact"></a>

## 11\. Contact

<a name="support"></a>

###11.1\. Support
For trouble tickets with RPC WebSocket, please, use the github issue list.

<a name="projects"></a>

###11.2\. Projects
I am available for commercial projects.

In commercial projects, I often do the initial prototyping by myself. After that, I manage external developer contributions through github and bitbucket. I usually end up being the long-term go-to person for how to evolve the system. My work involves reviewing Javascript for both the web and NodeJS. I occasionally still do PHP. The startups I work for, are usually located elsewhere but I do all of my work from Cambodia. If you are in need of a source code manager for your project, feel free to contact me at erik@sankuru.biz.

<a name="license"></a>

##12\. License

        RPC Websocket
        Written by Erik Poupaert, Cambodia
        (c) 2014
        Licensed under the LGPL

