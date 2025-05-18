require("dotenv").config();
const socketio = require("socket.io");

let io;

exports.init = (httpServer) => {
  io = socketio(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", (socket) => {
    console.log("A user connected");
    socket.emit("connection", { message: "Connected to the server" });
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
  return io;
};

exports.getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
