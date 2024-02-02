import type { Server } from "socket.io";
import type { DefaultEventsMap } from "socket.io/dist/typed-events";
import prisma from "../db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any

type Options = {
    socketId: string;
    titleId: string;
    userId: string;
    content: string;
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>;
    currentRoom: string;
    commentReplyPostId?: string;
};
const submitComment = async ({
    socketId,
    titleId,
    userId,
    content,
    io,
    currentRoom,
    commentReplyPostId,
}: Options) => {
    const getPost = await prisma.post.findUnique({
        where: { titleId: titleId },
        select: {
            id: true,
        },
    });

    if (!getPost) throw new Error("Post not found.");
    type SubmitQuery = {
        data: {
            user: object;
            post: object;
            postCommentReply?: object;
            content: string;
        };
    };
    const submitQuery: SubmitQuery = {
        data: {
            user: {
                connect: {
                    id: userId,
                },
            },
            post: {
                connect: {
                    id: getPost.id,
                },
            },
            content: JSON.parse(content as string),
        },
    };
    if (commentReplyPostId !== undefined) {
        submitQuery.data = {
            ...submitQuery.data,
            postCommentReply: {
                connect: {
                    id: commentReplyPostId,
                },
            },
        };
    }

    const submitComment = await prisma.postComment.create({
        ...submitQuery,
    });
    if (submitComment) {
        if (commentReplyPostId) {
            io.to(currentRoom).emit("refetchReplies");
            io.to(socketId).emit("clearContentCommentBox");
        } else {
            io.to(socketId).emit("clearContentCommentBox");
        }
        io.to(currentRoom).emit("refetchComments");
    }
};

export { submitComment };
