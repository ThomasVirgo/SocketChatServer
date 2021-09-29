const { Server } = require("socket.io");

const io = new Server();

io.on("connection", (socket) => {
    console.log('User connected', socket.id);
    let socketInstances = [];

    // send private message to another user given their socket id
    socket.on("private message", (anotherSocketId, msg) => {
        socket.to(anotherSocketId).emit("private message", socket.id, msg);
    });

    // update the list of socket instances when a user logs in
    socket.on('user login', async() => {
        socketInstances = await io.fetchSockets();
        console.log(socketInstances)
    });
});

io.listen(3000);