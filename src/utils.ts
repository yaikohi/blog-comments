import { env } from "bun";
import { CommentType, EventType } from "./types";

export const getURL = (): string => {
  const PORT_EVENTBUS = `4005`;
  const HOST_EVENTBUS = `event-bus-srv`;
  const URL_EVENTBUS = `http://${HOST_EVENTBUS}:${PORT_EVENTBUS}/events`;

  const localURL = `http://localhost:4005/events`;

  if (env.NODE_ENV === "development") {
    return localURL;
  } else {
    return URL_EVENTBUS;
  }
};

export async function sendCommentCreatedEvent(
  { postId, comment }: { postId: string; comment: CommentType },
) {
  const event: EventType = {
    type: "comment.created",
    data: { comment, postId },
  };
  const url = getURL();
  try {
    console.log(`Sending ${event.type} to event-bus.`);
    await fetch(url, {
      method: "POST",
      body: JSON.stringify(event),
      headers: { "Content-Type": "application/json" },
    });

    console.log(`Finished sending ${event.type} to event-bus.`);
  } catch (err) {
    console.error(err);
  }
}

export async function sendCommentUpdatedEvent(
  { postId, comment }: { postId: string; comment: CommentType },
) {
  const url = getURL();
  const event: EventType = {
    type: "comment.updated",
    data: { comment, postId },
  };
  try {
    console.log(`Sending ${event.type} to event-bus.`);
    await fetch(url, {
      method: "POST",
      body: JSON.stringify(event),
      headers: { "Content-Type": "application/json" },
    });

    console.log(`Finished sending ${event.type} to event-bus.`);
  } catch (err) {
    console.error(err);
  }
}
