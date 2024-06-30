const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');


async function main() {
    const db = await open({
        filename: 'chat.db',
        driver: sqlite3.Database
    });

    // create our 'messages' table (you can ignore the 'client_offset' column for now)
    await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_offset TEXT UNIQUE,
        content TEXT
    );
  `);

    const app = express();
    const server = createServer(app);
    const io = new Server(server, {
        connectionStateRecovery: {} // temporarily store all the events that are sent when disconnected and will try to restore the state of a client when it reconnects
    });

    app.get('/', (req, res) => {
        res.sendFile(join(__dirname, 'index.html'));
    });


    io.on('connection', async (socket) => { // when a socket connects do this
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




        socket.on('chat message', async (msg) => { // listen for chat message event
            let result;
            try {
                // store the message in the database
                result = await db.run('INSERT INTO messages (content) VALUES (?)', msg);
            } catch (e) {
                // TODO handle the failure
                return;
            }
            // include the offset with the message
            io.emit('chat message', msg, result.lastID); // emit chat message event to all connected sockets
        });
        if (!socket.recovered) {
            // if the connection state recovery was not successful
            try {
                await db.each('SELECT id, content FROM messages WHERE id > ?',
                    [socket.handshake.auth.serverOffset || 0],
                    (_err, row) => {
                        socket.emit('chat message', row.content, row.id);
                    }
                )
            } catch (e) {
                // something went wrong
            }
        }

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
        ;
    });

    server.listen(3000, () => {
        console.log('server running at http://localhost:3000');
    });
}

main()