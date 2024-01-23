import cors from "@elysiajs/cors";
import { Elysia, t } from "elysia";
import { CommentType } from "./types";
import { EventBodySchema } from "./schemas";
import { sendCommentCreatedEvent } from "./utils";

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
        console.log(`Received comment.`);
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
