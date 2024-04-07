import type { Server } from "socket.io";
import type { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Resend } from "resend";
import prisma from "../db";
import notificationTemplate from "../email/templates/notification";

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
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            sendNotificationEmail: true,
            email: true,
            sendNotificationPhone: true,
            name: true,
        },
    });
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
    if (user?.sendNotificationEmail && user.email && user.name) {
        let postName: string | undefined = "";
        if (postId) {
            const post = await prisma.post.findUnique({
                where: { id: postId },
            });
            postName = post?.title;
        }
        const baseUrl =
            process.env.NODE_ENV === "production"
                ? "https://zefer.blog"
                : "http://localhost:3000";
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { data, error } = await resend.emails.send({
            from: "ZeFer <notifications@zefer.blog>",
            to: [user.email],
            subject: `${from} ${message}`,
            html: notificationTemplate({
                to: user.name,
                from,
                message,
                postName,
                actionUrl: `${baseUrl}/${actionUrl}`,
            }),
        });

        if (error) {
            return console.error({ error });
        }

        console.log({ data });
    }
    if (postNotification) io.to(userId).emit("notifications", fromUserId);
};

export { submitNotification };
