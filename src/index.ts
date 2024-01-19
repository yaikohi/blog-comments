import cors from "@elysiajs/cors";
import { Elysia, t } from "elysia";
import { CommentType, EventType } from "./types";
import { EventBodySchema } from "./schemas";
// --- SERVICES -- PORTS
const PORT_EVENTBUS = `4005`;
// --- SERVICES -- HOSTS
const HOST_EVENTBUS = `event-bus-srv`;
// --- URLS
export const URL_EVENTBUS = `http://${HOST_EVENTBUS}:${PORT_EVENTBUS}/events`;

// --- DB
// const DB: PostDBType = {};
// const posts: PostType[] = [];

// --- APP.CONFIG
const PORT = 4001;
// --- APP
const app = new Elysia();

// --- MIDDLEWARE
app
  .use(cors());

// --- ROUTES
app
  .group("/events", (app) =>
    app
      .post("/", async ({ body }) => {
        const { type, data } = body;
        if (type === "comment.moderated") {
          // @ts-ignore
          await sendCommentUpdatedEvent(data);
        }
      }, {
        body: EventBodySchema,
      }))
  .group("/posts", (app) =>
    app
      .post("/:id/comments", async ({ body, params, set }) => {
        console.log({ commentServiceBodyReceived: body });
        const postId = params.id;
        const commentId = crypto.randomUUID();

        const newComment: CommentType = {
          id: commentId,
          content: body.content,
          status: "PENDING",
        };

        // const post = DB[postId];

        console.log({ newComment });
        // if (!post) {
        //   console.log("Not found!");
        //   set.status = "Not Found";
        //   return { success: false, message: "Post doesn't exist. " };
        // }

        // post.comments.push(newComment);
        await sendCommentCreatedEvent({ postId, comment: newComment });

        set.status = "OK";
        return { success: true, message: "Comment was posted." };
      }, {
        body: t.Object({
          content: t.String(),
        }),
        params: t.Object({
          id: t.String(),
        }),
      }))
  .listen(PORT);

console.log(
  `🦊 Elysia is running the 'comments' service at ${app.server?.hostname}:${app.server?.port}`,
);

export async function sendCommentCreatedEvent(
  { postId, comment }: { postId: string; comment: CommentType },
) {
  const event: EventType = {
    type: "comment.created",
    data: { comment, postId },
  };
  try {
    await fetch(URL_EVENTBUS, {
      method: "POST",
      body: JSON.stringify(event),
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
  }
}

export async function sendCommentUpdatedEvent(
  { postId, comment }: { postId: string; comment: CommentType },
) {
  const URL_EB = `http://localhost:4005/events`;
  const event: EventType = {
    type: "comment.updated",
    data: { comment, postId },
  };
  try {
    await fetch(URL_EB, {
      method: "POST",
      body: JSON.stringify(event),
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
  }
}
