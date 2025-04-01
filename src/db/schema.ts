import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const rooms = sqliteTable("rooms", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at"),
});

export const offers = sqliteTable("offers", {
  roomId: text("room_id").primaryKey(),
  offer: text("offer"),
});

export const answers = sqliteTable("answers", {
  roomId: text("room_id").primaryKey(),
  answer: text("answer"),
});

export const candidates = sqliteTable("candidates", {
  id: integer("id").primaryKey(),
  roomId: text("room_id"),
  candidate: text("candidate"),
  isOfferer: integer("is_offerer"),
});
