import { getUser, getUserId, createUser } from "./auth";
import { getNotes, addNote, getNote, updateNote, deleteNote } from "./notes";
export class User {
  static getUser = getUser;
  static getUserId = getUserId;
  static createUser = createUser;
}

export class Note {
  static getNotes = getNotes;
  static addNote = addNote;
  static getNote = getNote;
  static updateNote = updateNote;
  static deleteNote = deleteNote;
}