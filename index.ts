import http from "node:http";
import { Server } from "socket.io";
import type { Socket } from "socket.io";
import socketAuthorization from "./controllers/socketAuthorization";
import { submitComment } from "./controllers/socketComment";
import type { PostComment } from "@prisma/client";
import type { UserNotifications } from "@prisma/client";
import { submitNotification } from "./controllers/socketNotifications";
import prisma from "./db";

const PORT = process.env.PORT || 5000;
const env = process.env.NODE_ENV;

const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: {
        origin:
            env === "production"
                ? "https://zefer.vercel.app"
                : "http://localhost:3000", // Adjust this to your client's origin
        methods: ["GET", "POST"],
    },
});
let currentRoom: string;
let notifRoom: string;

async function leaveAllRooms(socket: Socket) {
    const rooms = Array.from(socket.rooms);

    // Skip the default room, which has the socket ID as its name
    const checkRoomIfUserId = await prisma.user.findUnique({
        where: { id: notifRoom ?? "" },
        select: {
            id: true,
        },
    });
    rooms.forEach((room) => {
        if (
            room !== socket.id &&
            room !== checkRoomIfUserId?.id &&
            room !== currentRoom
        ) {
            socket.leave(room);
        }
    });
}

io.use((socket, next) => socketAuthorization(socket, next));
io.on("connection", (socket: Socket) => {
    socket.conn.once("upgrade", () =>
        console.log("Transport upgraded to", socket.conn.transport.name),
    );
    socket.on("initializeSocketPostRoom", (titleId: string) => {
        leaveAllRooms(socket);
        socket.join(titleId);
        currentRoom = titleId;
    });

    socket.on("initializeSocketNotificationRoom", (userId: string) => {
        leaveAllRooms(socket);
        socket.join(userId);
        notifRoom = userId;
    });

    socket.on(
        "submitComment",
        async ({
            titleId,
            userId,
            content,
            commentReplyPostId,
        }: PostComment & {
            titleId: string;
            content: string;
            commentReplyPostId: string;
        }) => {
            const rooms = Array.from(socket.rooms);
            if (!rooms.find((room) => room === currentRoom))
                await socket.join(currentRoom);
            await submitComment({
                socketId: socket.id,
                titleId,
                userId,
                content,
                io,
                currentRoom,
                commentReplyPostId,
            });
        },
    );

    socket.on(
        "submitNotification",
        async ({
            userId,
            postId,
            fromUserId,
            from,
            fromImage,
            message,
            actionUrl,
        }: UserNotifications) => {
            await submitNotification({
                userId,
                postId,
                fromUserId,
                from,
                fromImage,
                message,
                actionUrl,
                io,
            });
        },
    );
});

httpServer.listen(PORT, () => {
    console.log("Server is listening on port " + PORT);
});
