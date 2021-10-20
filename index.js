const { Server } = require("socket.io");

const io = new Server({
    cors: {
      origin: ["http://localhost:4000"],
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

    // list all users and send them to client
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
        users.push({
        userID: socket.username,
        socketId: id,
        });
    }
    socket.emit("users", users);

    // tell any other users that you have connected
    socket.broadcast.emit("user connected", {
        userID: socket.username,
        socketId: socket.id,
    });

    // send private message to another user given their socket id
    socket.on("private message", (anotherSocketId, msg) => {
        socket.to(anotherSocketId).emit("private message", socket.id, msg);
    });

    // if the user disconnects, tell all other clients
    socket.on("disconnect", ()=>{
        socket.broadcast.emit("user disconnected", {
            userID: socket.username,
            socketId: socket.id,
        })
    })

});


io.listen(3000);