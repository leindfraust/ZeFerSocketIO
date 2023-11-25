import http from 'node:http'
import { Server } from "socket.io";
import type { Socket } from "socket.io";
import socketAuthorization from './controllers/socketAuthorization';
import { submitComment } from './controllers/socketComment';
import { PostComment } from '@prisma/client';

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Adjust this to your client's origin
    methods: ["GET", "POST"]
  }
});

function leaveAllRooms(socket: Socket) {
  const rooms = Array.from(socket.rooms);

  // Skip the default room, which has the socket ID as its name
  rooms.forEach((room) => {
    if (room !== socket.id) {
      socket.leave(room);
    }
  });
}

let currentRoom: string
io.use((socket, next) => socketAuthorization(socket, next))
io.on("connection", (socket: Socket) => {

  socket.on('initializeSocketPostRoom', (titleId: string) => {
    leaveAllRooms(socket)
    socket.join(titleId)
    currentRoom = titleId
  })

  socket.on('submitComment', async ({ titleId, userId, content, commentReplyPostId }: PostComment & { titleId: string, content: string, commentReplyPostId: string }) => {
    const rooms = Array.from(socket.rooms);
    if (!rooms.find(room => room === currentRoom)) socket.join(currentRoom)
    submitComment(titleId, userId, content, io, currentRoom, commentReplyPostId)
  })
});

httpServer.listen(5000, () => {
  console.log("Server is listening on port 5000");
});