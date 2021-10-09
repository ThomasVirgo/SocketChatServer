const { Server } = require("socket.io");

const io = new Server({
    cors: {
      origin: "http://localhost:4000",
      methods: ["GET", "POST"]
    }});

io.on("connection", (socket) => {
    console.log('User connected', socket.id);
    let socketInstances = [];

    // send private message to another user given their socket id
    socket.on("private message", (anotherSocketId, msg) => {
        console.log(msg);
        console.log(anotherSocketId);
        socket.to(anotherSocketId).emit("private message", socket.id, msg);
    });

    // update the list of socket instances when a user logs in
    socket.on('user login', async(user_id) => {
        // chaneg this to update the user sockets!
        socket.user_id = user_id
        socketInstances = await io.fetchSockets();
        console.log('sockets fetched')
    });

    // tell the client all the sockets and their corresponding user
    socket.on('get all active sockets', async() => {
        // socketInstances = await io.fetchSockets();
        let socketInfo = socketInstances.map(item => {
            return {"socket_id": item.id, "user_id": item.user_id}
        })
        console.log(socketInfo)
        // send to all clients (broadcast)
        io.emit('recieve socket info', socketInfo)
    })
});


io.listen(3000);