const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});


io.on('connection', (socket) => { // when a socket connects do this
    console.log('a user connected');


    // // join the room named 'some room'
    // socket.join('some room');
    //
    // // broadcast to all connected clients in the room
    // io.to('some room').emit('hello', 'world');
    //
    // // broadcast to all connected clients except those in the room
    // io.except('some room').emit('hello', 'world');
    //
    // // leave the room
    // socket.leave('some room');




    socket.on('chat message', (msg) => { // listen for chat message event
        io.emit('chat message', msg); // emit chat message event to all connected sockets
    });

    //
    // socket.on('with-ack-1', (arg1, arg2, callback) => { // receive request event from client and send acknowledgement
    //     console.log(arg1); // { foo: 'bar' }
    //     console.log(arg2); // 'baz'
    //     callback({
    //         status: 'ok'
    //     });
    // });

    // socket.on('with-ack-2', (arg1, arg2, callback) => {// receive request event from client and send acknowledgement
    //     console.log(arg1); // { foo: 'bar' }
    //     console.log(arg2); // 'baz'
    //     callback({
    //         status: 'ok'
    //     });
    // });




    // socket.onAny((eventName, ...args) => { // catch all events
    //     console.log("Catch all listener from server"); // 'hello'
    // });


    // socket.onAnyOutgoing((eventName, ...args) => { // catch all outgoing events
    //     console.log(eventName); // 'hello'
    //     console.log(args); // [ 1, '2', { 3: '4', 5: ArrayBuffer (1) [ 6 ] } ]
    // });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});