import type { Server } from "socket.io"
import type { DefaultEventsMap } from "socket.io/dist/typed-events"
import prisma from "../db"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const submitNotification = async (userId: string, from: string | null, fromImage: string | null, message: string, actionUrl: string, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    const postNotification = await prisma.userNotifications.create({
        data: {
            userId: userId,
            from: from,
            fromImage: fromImage,
            message: message,
            actionUrl: actionUrl
        }
    })
    if (postNotification) io.to(userId).emit("notifications")
}

export { submitNotification }