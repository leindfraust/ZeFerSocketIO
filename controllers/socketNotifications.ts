import type { Server } from "socket.io";
import type { DefaultEventsMap } from "socket.io/dist/typed-events";
import prisma from "../db";

type Options = {
    userId: string;
    postId: string | null;
    fromUserId: string | null;
    from: string | null;
    fromImage: string | null;
    message: string;
    actionUrl: string;
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>;
};
const submitNotification = async ({
    userId,
    postId,
    fromUserId,
    from,
    fromImage,
    message,
    actionUrl,
    io,
}: Options) => {
    const postNotification = await prisma.userNotifications.create({
        data: {
            userId: userId,
            from: from,
            fromImage: fromImage,
            message: message,
            ...(postId && {
                postId,
            }),
            ...(fromUserId && {
                fromUserId,
            }),
            actionUrl: actionUrl,
        },
    });
    if (postNotification) io.to(userId).emit("notifications", fromUserId);
};

export { submitNotification };
