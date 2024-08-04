import type { IncomingMessage, ServerResponse } from "node:http";
import { sendSuccess } from "../utils/response";
import { Note } from "../model";
import { checkAuth } from "../middlewares/auth";
import {
  badRequestError,
  internalServerError,
  notFoundError,
} from "../utils/errors";
import { getUserId } from "../model/auth";
import { STATUS_CODES } from "../constants/types";
import { extractIdFromUrl } from "../utils/helpers";

export async function getNotes(req: IncomingMessage, res: ServerResponse) {
  sendSuccess(res, { data: { notes: await Note.getNotes() } });
}
export async function getNote(req: IncomingMessage, res: ServerResponse) {
  const id = extractIdFromUrl(req, 2);

  if (isNaN(id)) {
    return badRequestError(res, "Invalid Id");
  }

  const note = await Note.getNote(id);
  if (!note) {
    return internalServerError(res, "Error getting note");
  }

  sendSuccess(res, {
    statusCode: STATUS_CODES.OK,
    data: { note },
  });
}

export function addNote(req: IncomingMessage, res: ServerResponse) {
  const auth = checkAuth(req, res);
  if (!auth) return;

  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    const userId = getUserId(req);
    const { title, content } = JSON.parse(body);
    if (!title || !content || !userId) {
      return badRequestError(res, "All fields required");
    }
    const note = await Note.addNote({
      title,
      content,
      userId,
    });
    if (!note) {
      return internalServerError(res, "Error creating note");
    }

    sendSuccess(res, {
      statusCode: STATUS_CODES.CREATED,
      data: { note },
    });
  });
}
export function updateNote(req: IncomingMessage, res: ServerResponse) {
  const auth = checkAuth(req, res);
  if (!auth) return;

  const id = extractIdFromUrl(req, 2);
  if (isNaN(id)) {
    return badRequestError(res, "Invalid Id");
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    const userId = getUserId(req);

    const { title, content } = JSON.parse(body);
    if (!id || !title || !content || !userId) {
      return badRequestError(res, "All fields required");
    }
    const note = await Note.updateNote({
      noteId: id,
      title,
      content,
      userId,
    });

    if (note === null) {
      return notFoundError(res, "Note not found");
    }
    if (!note) {
      return internalServerError(res, "Error updating note");
    }

    sendSuccess(res, {
      statusCode: STATUS_CODES.CREATED,
      data: { note },
    });
  });
}
export async function deleteNote(req: IncomingMessage, res: ServerResponse) {
  const auth = checkAuth(req, res);
  if (!auth) return;

  const id = extractIdFromUrl(req, 2);
  if (isNaN(id)) {
    return badRequestError(res, "Invalid Id");
  }
  const userId = getUserId(req);

  const deletedNote = await Note.deleteNote({ noteId: id, userId });

  if (deletedNote === null) {
    return notFoundError(res, "Note not found");
  }

  sendSuccess(res, {
    message: "Note deleted successfully",
    data: { note: deletedNote },
  });
}