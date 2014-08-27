#!/usr/bin/env sh

#same name is in require('...')
project=rpc-websocket

#file (+ dependencies) that the browser should load
browserMainFile=lib/rpc-socket.js

#generate documentation of:
apiFiles="lib/rpc-socket.js lib/rpc-server.js"
newMarkDownLevelForFunctionHeadings=4

