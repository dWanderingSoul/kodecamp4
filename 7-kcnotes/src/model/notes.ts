import type { UpdateNoteParams } from "../constants/types";
import { db } from "../database";

export async function getNotes() {
  if (!db) throw Error("DB not init.");
  return db.all("SELECT * FROM notes");
}

export async function getNote(noteId: number) {
  if (!db) throw Error("DB not initialized");
  return db.get<{ id: number; title: string; content: string }>(
    `SELECT id, title, content, user_id, created_at FROM notes WHERE id = ?`,
    [noteId]
  );
}

export async function addNote({
  title,
  content,
  userId,
}: {
  title: string;
  content: string;
  userId: number;
}) {
  if (!db) throw Error("DB not init.");
  const createdNote = await db.run(
    `INSERT INTO notes (title, content, user_id) VALUES (?, ?, ?)`,
    [title, content, userId]
  );

  const noteId = createdNote.lastID;
  return db.get<{ id: number; title: string; content: string }>(
    `SELECT id, title, content, created_at FROM notes WHERE id = ?`,
    [noteId]
  );
}

export async function getUserNotes(userId: number) {
  if (!db) throw Error("DB not init.");
  return db.all(`SELECT * FROM notes WHERE user_id = ?`, [userId]);
}

export async function updateNote({
  noteId,
  title,
  content,
  userId,
}: UpdateNoteParams) {
  if (!db) throw Error("DB not initialized");

  const result = await db.run(
    `UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?`,
    [title, content, noteId, userId]
  );

  if (result.changes === 0) {
    return null;
  } else {
    return db.get<{ id: number; title: string; content: string }>(
      `SELECT id, title, content, created_at FROM notes WHERE id = ?`,
      [noteId]
    );
  }
}

export async function deleteNote({
  noteId,
  userId,
}: {
  noteId: number;
  userId: number;
}) {
  if (!db) throw Error("DB not initialized");

  const noteToDelete = await db.get<{
    id: number;
    title: string;
    content: string;
  }>(`SELECT id, title, content FROM notes WHERE id = ? AND user_id = ?`, [
    noteId,
    userId,
  ]);

  if (!noteToDelete) {
    return null;
  }

  await db.run(`DELETE FROM notes WHERE id = ?`, [noteToDelete.id]);

  return noteToDelete;
}