const { Server } = require("socket.io");

const io = new Server({
    cors: {
      origin: ["http://localhost:4000", "https://virgo-chat.netlify.app"],
      methods: ["GET", "POST"]
    }});

io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("invalid username"));
    }
    socket.username = username;
    next();
});

io.on("connection", (socket) => {

    console.log('user connected with id: ', socket.id);
    // list all users and send them to client
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
        users.push({
        email: socket.username,
        socketId: id,
        });
    }
    socket.emit("users", users);

    // emit only goes to specific user 
    // broadcast goes to all other users except the person who sent it 

    // tell any other users that you have connected, so they can add you to their global state.
    socket.broadcast.emit("user connected", {
        email: socket.username,
        socketId: socket.id,
    });

    // send private message to another user given their socket id
    socket.on("private message", (anotherSocketId, msg) => {
        socket.to(anotherSocketId).emit("private message", socket.id, msg);
    });

    // if the user disconnects, tell all other clients
    socket.on("disconnect", ()=>{
        console.log('user disconnected...');
        socket.broadcast.emit("user disconnected", {
            email: socket.username,
            socketId: socket.id,
        })
    })
});


io.listen(process.env.PORT || 3000);